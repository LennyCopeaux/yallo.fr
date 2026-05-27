import { db } from "@/db";
import { orders, orderItems, restaurants, callLogs } from "@/db/schema";
import { eq, and, inArray, count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { pushVoiceOrderToHubrise } from "@/lib/services/hubrise";
import { normalizeSubmitOrderPayload } from "@/lib/services/submit-order-args";
import { trySendOrderConfirmationSms } from "@/lib/services/twilio-sms";
import { updateVapiAssistant, buildAssistantPayloadForCall } from "@/lib/services/vapi-agent";
import { getBusinessHoursOpenState } from "@/lib/services/business-hours";
import { normalizeFrenchPhoneNumber } from "@/lib/utils";

export const runtime = "nodejs";

interface ToolCall {
  id: string;
  /** Format direct (ancien VAPI) */
  name?: string;
  /** Format OpenAI-compatible (VAPI actuel) */
  function?: {
    name: string;
    arguments: string | Record<string, unknown>;
  };
  arguments?: Record<string, unknown>;
}

/**
 * Format VAPI pour les tool calls (envoyé sur server URL configurée dans l'assistant).
 * https://docs.vapi.ai/tools/custom-tools
 */
interface VapiWebhookBody {
  message?: {
    type: string;
    /** Présent pour type=tool-calls */
    toolCallList?: ToolCall[];
    /** Présent pour type=end-of-call-report */
    durationSeconds?: number;
    endedReason?: string;
    call?: {
      id?: string;
      startedAt?: string;
      endedAt?: string;
      customer?: {
        number?: string;
      };
    };
  };
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `#${timestamp}${random}`;
}

function parsePickupTime(pickupTimeStr?: string): Date | null {
  if (!pickupTimeStr) return null;

  const match = /^(\d{1,2}):(\d{2})$/.exec(pickupTimeStr);
  if (!match) return null;

  const now = new Date();
  const pickup = new Date(now);
  pickup.setHours(Number.parseInt(match[1], 10), Number.parseInt(match[2], 10), 0, 0);

  if (pickup < now) {
    pickup.setDate(pickup.getDate() + 1);
  }

  return pickup;
}

function getCurrentWaitCeilMinutes(
  status: "CALM" | "NORMAL" | "RUSH" | "STOP",
  statusSettings: typeof restaurants.$inferSelect["statusSettings"]
): number {
  if (!statusSettings) return 15;
  const setting = statusSettings[status];
  if (!setting) return 15;

  if ("fixed" in setting && typeof setting.fixed === "number") {
    return Math.max(0, Math.ceil(setting.fixed));
  }

  if ("max" in setting && typeof setting.max === "number") {
    return Math.max(0, Math.ceil(setting.max));
  }

  return 15;
}

function roundUpToNextTenMinutes(date: Date): Date {
  const rounded = new Date(date);
  rounded.setSeconds(0, 0);
  const minutes = rounded.getMinutes();
  const remainder = minutes % 10;
  if (remainder !== 0) {
    rounded.setMinutes(minutes + (10 - remainder));
  }
  return rounded;
}

function formatFrenchHour(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  options?: string;
}

interface SubmitOrderArgs {
  customer_name: string;
  customer_phone?: string;
  items: OrderItem[];
  pickup_time?: string;
  notes?: string;
}

async function handleSubmitOrder(
  restaurantId: string,
  args: SubmitOrderArgs,
): Promise<string> {
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);

  if (!restaurant) {
    logger.error(
      "Restaurant introuvable",
      new Error(`restaurantId: ${restaurantId}`),
      { restaurantId }
    );
    throw new Error("Restaurant introuvable");
  }

  if (restaurant.currentStatus === "STOP") {
    return JSON.stringify({
      success: false,
      message: "Le restaurant est actuellement fermé et ne prend plus de commandes.",
    });
  }

  const hoursState = getBusinessHoursOpenState(restaurant.businessHours);
  if (hoursState.isConfigured && !hoursState.isOpen) {
    return JSON.stringify({
      success: false,
      message: "Le restaurant est actuellement fermé selon ses horaires d'ouverture.",
    });
  }

  if (!args.items || args.items.length === 0) {
    return JSON.stringify({
      success: false,
      message: "La commande ne contient aucun article.",
    });
  }

  if (!args.pickup_time?.trim()) {
    return JSON.stringify({
      success: false,
      message:
        "Merci d'indiquer une heure de retrait souhaitée (HH:MM) avant de finaliser la commande.",
    });
  }

  const pickupTime = parsePickupTime(args.pickup_time);
  if (!pickupTime) {
    return JSON.stringify({
      success: false,
      message: "Format d'heure invalide. Merci d'indiquer l'heure de retrait au format HH:MM.",
    });
  }

  const waitMinutes = getCurrentWaitCeilMinutes(restaurant.currentStatus, restaurant.statusSettings);
  const earliestReadyAt = roundUpToNextTenMinutes(new Date(Date.now() + waitMinutes * 60 * 1000));

  if (pickupTime.getTime() < earliestReadyAt.getTime()) {
    return JSON.stringify({
      success: false,
      message: `Le délai est trop court avec la charge actuelle en cuisine. Propose une heure de retrait à partir de ${formatFrenchHour(earliestReadyAt)}.`,
      earliest_pickup_time: formatFrenchHour(earliestReadyAt),
    });
  }

  const orderNumber = generateOrderNumber();

  const itemsForDb = args.items.map((item) => {
    const unitEuros = Number.isFinite(item.unit_price) ? item.unit_price : 0;
    const unitPriceCents = Math.round(unitEuros * 100);
    const quantity = item.quantity || 1;
    return {
      productName: item.product_name,
      quantity,
      unitPrice: unitPriceCents,
      totalPrice: unitPriceCents * quantity,
      options: item.options || null,
    };
  });

  const totalAmount = itemsForDb.reduce((sum, item) => sum + item.totalPrice, 0);

  const mergedCustomerPhone =
    (args.customer_phone?.trim() && normalizeFrenchPhoneNumber(args.customer_phone.trim())) ||
    null;

  const [createdOrder] = await db
    .insert(orders)
    .values({
      restaurantId: restaurant.id,
      orderNumber,
      customerName: args.customer_name || null,
      customerPhone: mergedCustomerPhone,
      status: "NEW",
      totalAmount,
      pickupTime,
      notes: args.notes || null,
    })
    .returning();

  await db.insert(orderItems).values(
    itemsForDb.map((item) => ({
      orderId: createdOrder.id,
      ...item,
    }))
  );

  if (restaurant.hubriseAccessToken && restaurant.hubriseLocationId) {
    try {
      const ref = orderNumber.replace(/^#/, "");
      await pushVoiceOrderToHubrise(restaurant.hubriseAccessToken, restaurant.hubriseLocationId, {
        ref,
        collectionCode: orderNumber,
        customerName: args.customer_name,
        customerPhone: mergedCustomerPhone ?? args.customer_phone,
        items: args.items,
        expectedTimeIso: pickupTime?.toISOString() ?? null,
        notes: args.notes ?? null,
      });
      logger.info("Commande synchronisée vers HubRise", {
        orderId: createdOrder.id,
        orderNumber,
        restaurantId: restaurant.id,
      });
    } catch (hubErr) {
      logger.error(
        "Échec envoi HubRise (commande enregistrée dans Yallo)",
        hubErr instanceof Error ? hubErr : new Error(String(hubErr)),
        { orderId: createdOrder.id, orderNumber, restaurantId: restaurant.id }
      );
    }
  }

  logger.info("Commande créée via VAPI", {
    orderId: createdOrder.id,
    orderNumber,
    restaurantId: restaurant.id,
    customerName: args.customer_name,
    itemCount: args.items.length,
    totalAmount,
  });

  if (
    restaurant.autoRushThreshold !== null &&
    restaurant.autoRushThreshold !== undefined &&
    restaurant.currentStatus !== "RUSH"
  ) {
    try {
      const [{ value: activeOrderCount }] = await db
        .select({ value: count() })
        .from(orders)
        .where(
          and(
            eq(orders.restaurantId, restaurant.id),
            inArray(orders.status, ["NEW", "PREPARING"])
          )
        );

      if (activeOrderCount >= restaurant.autoRushThreshold) {
        await db
          .update(restaurants)
          .set({ currentStatus: "RUSH", updatedAt: new Date() })
          .where(eq(restaurants.id, restaurant.id));

        if (restaurant.vapiAssistantId) {
          await updateVapiAssistant(restaurant.vapiAssistantId, {
            ...restaurant,
            currentStatus: "RUSH",
          });
        }

        logger.info("Passage automatique en RUSH", {
          restaurantId: restaurant.id,
          activeOrderCount,
          threshold: restaurant.autoRushThreshold,
        });
      }
    } catch (rushErr) {
      logger.error(
        "Erreur lors du calcul auto-rush",
        rushErr instanceof Error ? rushErr : new Error(String(rushErr)),
        { restaurantId: restaurant.id }
      );
    }
  }

  if (restaurant.smsConfirmationEnabled && process.env.TWILIO_ORDER_CONFIRMATION_SMS !== "false") {
    const fromRaw = process.env.TWILIO_SMS_FROM?.trim() || restaurant.twilioPhoneNumber?.trim();
    const toRaw = args.customer_phone?.trim();
    if (fromRaw && toRaw) {
      await trySendOrderConfirmationSms({
        toRaw,
        fromRaw,
        restaurantName: restaurant.name,
        orderNumber,
        lines: itemsForDb.map((item) => {
          const lineEuros = (item.totalPrice / 100).toFixed(2);
          const optionsSuffix = item.options ? ` (${item.options})` : "";
          return `${item.productName}${optionsSuffix} x${item.quantity} — ${lineEuros} €`;
        }),
        totalEuros: (totalAmount / 100).toFixed(2),
        customerName: args.customer_name || null,
        pickupTime: pickupTime
          ? pickupTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
          : null,
        notes: args.notes || null,
      });
    }
  }

  return JSON.stringify({
    success: true,
    order_number: orderNumber,
    message: `La commande ${orderNumber} a été enregistrée avec succès.`,
  });
}

/**
 * Enregistre un appel terminé dans call_logs.
 * Appelé sur réception d'un message de type "end-of-call-report" depuis VAPI.
 */
async function handleEndOfCall(
  restaurantId: string,
  message: NonNullable<VapiWebhookBody["message"]>
): Promise<void> {
  const callId = message.call?.id;
  const durationSeconds = message.durationSeconds;

  if (!callId) {
    logger.warn("Webhook VAPI end-of-call-report : call.id manquant", { restaurantId });
    return;
  }

  if (typeof durationSeconds !== "number" || durationSeconds < 0) {
    logger.warn("Webhook VAPI end-of-call-report : durationSeconds invalide", {
      restaurantId,
      callId,
      durationSeconds,
    });
    return;
  }

  const [restaurant] = await db
    .select({ id: restaurants.id, organizationId: restaurants.organizationId })
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);

  if (!restaurant) {
    logger.warn("Webhook VAPI end-of-call-report : restaurant introuvable", { restaurantId });
    return;
  }

  if (!restaurant.organizationId) {
    logger.warn("Webhook VAPI end-of-call-report : restaurant sans organisation", { restaurantId });
    return;
  }

  const startedAt = message.call?.startedAt ? new Date(message.call.startedAt) : null;
  const endedAt = message.call?.endedAt ? new Date(message.call.endedAt) : null;
  const endedReason = message.endedReason ?? "completed";
  const status = (endedReason === "customer-ended-call" || endedReason === "assistant-ended-call")
    ? "completed" as const
    : endedReason === "no-answer"
      ? "no-answer" as const
      : "completed" as const;

  await db
    .insert(callLogs)
    .values({
      restaurantId: restaurant.id,
      organizationId: restaurant.organizationId,
      externalCallId: callId,
      provider: "vapi",
      durationSeconds: Math.round(durationSeconds),
      startedAt,
      endedAt,
      status,
    })
    .onConflictDoNothing(); // idempotent si le webhook est rejoué

  logger.info("Appel VAPI enregistré dans call_logs", {
    restaurantId,
    callId,
    durationSeconds,
    status,
  });
}

function verifyWebhookSecret(request: Request): boolean {
  if (process.env.VAPI_WEBHOOK_DISABLE_AUTH === "true") {
    logger.warn(
      "VAPI_WEBHOOK_DISABLE_AUTH=true — authentification webhook désactivée (ne pas utiliser en prod)"
    );
    return true;
  }

  const secret = process.env.VAPI_WEBHOOK_SECRET?.trim();
  const vercelEnv = process.env.VERCEL_ENV?.trim();
  const isStrictProduction = vercelEnv === "production";

  if (!secret) {
    if (isStrictProduction) {
      logger.error(
        "VAPI_WEBHOOK_SECRET manquant en production Vercel — le webhook renvoie 401",
        new Error("missing_webhook_secret"),
        { vercelEnv, nodeEnv: process.env.NODE_ENV }
      );
      return false;
    }
    logger.warn("VAPI_WEBHOOK_SECRET non défini - webhook accepté hors production Vercel", {
      vercelEnv,
      nodeEnv: process.env.NODE_ENV,
    });
    return true;
  }

  const incoming = request.headers.get("x-vapi-secret")?.trim();
  if (!incoming) {
    logger.warn("Webhook VAPI : header x-vapi-secret absent", {
      vercelEnv,
      nodeEnv: process.env.NODE_ENV,
    });
    return false;
  }

  const ok = incoming === secret;
  if (!ok) {
    logger.warn("Webhook VAPI : secret reçu ne correspond pas à VAPI_WEBHOOK_SECRET", {
      vercelEnv,
      nodeEnv: process.env.NODE_ENV,
    });
  }
  return ok;
}

export async function POST(request: Request) {
  try {
    if (!verifyWebhookSecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as VapiWebhookBody;
    const message = body.message;

    // Le restaurantId est embarqué dans l'URL : /api/vapi/webhook?rid=<restaurantId>
    const url = new URL(request.url);
    const restaurantId = url.searchParams.get("rid") ?? "";

    if (!restaurantId) {
      logger.error("Webhook VAPI : paramètre rid manquant dans l'URL", new Error("missing_rid"));
      return NextResponse.json(
        {
          results: [
            {
              toolCallId: "unknown",
              result: "Configuration incorrecte : rid manquant. Mettez à jour l'assistant depuis le dashboard.",
            },
          ],
        },
        { status: 200 }
      );
    }

    // assistant-request : VAPI demande la config de l'assistant en début d'appel (approche dynamique)
    // On génère le prompt avec l'heure actuelle pour permettre la détection des horaires en temps réel
    if (message?.type === "assistant-request" && restaurantId) {
      try {
        const [restaurant] = await db
          .select()
          .from(restaurants)
          .where(eq(restaurants.id, restaurantId))
          .limit(1);

        if (!restaurant) {
          logger.error("Webhook VAPI assistant-request : restaurant introuvable", new Error(restaurantId));
          return NextResponse.json({ error: "Restaurant introuvable" }, { status: 404 });
        }

        const assistantConfig = await buildAssistantPayloadForCall(restaurant);
        logger.info("Webhook VAPI assistant-request traité", {
          restaurantId,
          hasBusinessHours: Boolean(restaurant.businessHours),
        });
        return NextResponse.json({ assistant: assistantConfig });
      } catch (err) {
        logger.error(
          "Erreur assistant-request VAPI",
          err instanceof Error ? err : new Error(String(err)),
          { restaurantId }
        );
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
      }
    }

    // Traiter la fin d'appel (end-of-call-report)
    if (message?.type === "end-of-call-report" && restaurantId) {
      try {
        await handleEndOfCall(restaurantId, message);
      } catch (err) {
        logger.error(
          "Erreur handleEndOfCall VAPI",
          err instanceof Error ? err : new Error(String(err)),
          { restaurantId }
        );
      }
      return NextResponse.json({}, { status: 200 });
    }

    // Ignorer les messages qui ne sont pas des tool calls
    if (!message || message.type !== "tool-calls") {
      logger.info("Webhook VAPI : message ignoré (type non tool-calls)", {
        restaurantId,
        type: message?.type,
      });
      return NextResponse.json({}, { status: 200 });
    }

    const toolCallList = message.toolCallList ?? [];

    logger.info("Webhook VAPI tool-calls reçu", {
      restaurantId,
      tools: toolCallList.map((t) => t.name ?? t.function?.name),
    });

    const results: Array<{ toolCallId: string; result: string }> = [];

    for (const toolCall of toolCallList) {
      // VAPI envoie soit name+arguments à la racine (ancien format),
      // soit function.name + function.arguments (format OpenAI-compatible actuel)
      const toolName = toolCall.name ?? toolCall.function?.name;
      const rawArgs = toolCall.arguments ?? toolCall.function?.arguments;
      const toolArgs: Record<string, unknown> =
        typeof rawArgs === "string"
          ? (JSON.parse(rawArgs) as Record<string, unknown>)
          : (rawArgs ?? {});

      // Fallback : utiliser le numéro de l'appelant si le modèle n'a pas fourni customer_phone
      const callerPhone = message.call?.customer?.number;
      if (callerPhone && !toolArgs.customer_phone) {
        toolArgs.customer_phone = callerPhone;
      }

      if (toolName === "submit_order") {
        const normalized = normalizeSubmitOrderPayload(toolArgs);
        if (!normalized) {
          logger.warn("Webhook VAPI : données commande invalides", { args: toolCall.arguments });
          results.push({
            toolCallId: toolCall.id,
            result: JSON.stringify({
              success: false,
              message: "Données de commande incomplètes ou invalides.",
            }),
          });
          continue;
        }

        try {
          const result = await handleSubmitOrder(restaurantId, normalized);
          results.push({ toolCallId: toolCall.id, result });
        } catch (err) {
          logger.error(
            "Erreur handleSubmitOrder VAPI",
            err instanceof Error ? err : new Error(String(err)),
            { restaurantId }
          );
          results.push({
            toolCallId: toolCall.id,
            result: JSON.stringify({
              success: false,
              message: "Erreur lors de l'enregistrement de la commande.",
            }),
          });
        }
      } else {
        // Tool inconnu — répondre pour éviter que VAPI bloque
        results.push({
          toolCallId: toolCall.id,
          result: JSON.stringify({ success: false, message: `Tool inconnu : ${toolName}` }),
        });
      }
    }

    return NextResponse.json({ results }, { status: 200 });
  } catch (err) {
    logger.error(
      "Erreur webhook VAPI",
      err instanceof Error ? err : new Error(String(err))
    );
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
