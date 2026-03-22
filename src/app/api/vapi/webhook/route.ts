import { db } from "@/db";
import { orders, orderItems, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { pushVoiceOrderToHubrise } from "@/lib/services/hubrise";
import { normalizeSubmitOrderPayload } from "@/lib/services/vapi-submit-order-args";
import { trySendOrderConfirmationSms } from "@/lib/services/twilio-sms";
import { normalizeFrenchPhoneNumber } from "@/lib/utils";

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

interface ToolCall {
  id: string;
  name: string;
  parameters?: Record<string, unknown>;
  /** Variante OpenAI / certains payloads Vapi */
  arguments?: string | Record<string, unknown>;
}

interface VapiWebhookBody {
  message: {
    type?: string;
    call?: {
      id?: string;
      phoneNumber?: { number?: string };
      assistantId?: string;
      assistant?: { id?: string };
    };
    toolCallList?: ToolCall[];
    toolWithToolCallList?: Array<{
      name: string;
      toolCall: ToolCall;
    }>;
    assistant?: { id?: string };
    phoneNumber?: string;
    assistantId?: string;
  };
}

/** Vapi envoie parfois un libellé différent dans le dashboard (« Submit Order »). */
function isSubmitOrderToolName(name: string | undefined): boolean {
  if (!name) {
    return false;
  }
  const n = name.trim().toLowerCase().replaceAll(/\s+/g, "_");
  return n === "submit_order";
}

function isToolCallsPayload(body: VapiWebhookBody): boolean {
  const t = body.message?.type;
  if (t === "tool-calls" || t === "tool_calls") {
    return true;
  }
  const listLen = body.message?.toolCallList?.length ?? 0;
  const withLen = body.message?.toolWithToolCallList?.length ?? 0;
  return listLen > 0 || withLen > 0;
}

function extractCallerPhone(body: VapiWebhookBody): string | undefined {
  const n = body.message.call?.phoneNumber?.number;
  return typeof n === "string" && n.trim().length > 0 ? n.trim() : undefined;
}

async function findRestaurantByAssistantId(assistantId: string) {
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.vapiAssistantId, assistantId))
    .limit(1);
  return restaurant;
}

function generateOrderNumber(): string {
  // Utilise timestamp + random pour éviter les collisions
  const timestamp = Date.now().toString().slice(-6); // 6 derniers chiffres du timestamp
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

async function handleSubmitOrder(
  assistantId: string,
  args: SubmitOrderArgs,
  options?: Readonly<{ callerPhone?: string }>
): Promise<string> {
  const restaurant = await findRestaurantByAssistantId(assistantId);
  if (!restaurant) {
    logger.error("Restaurant introuvable pour l'assistant Vapi", new Error(`assistantId: ${assistantId}`));
    throw new Error("Restaurant introuvable");
  }

  if (restaurant.currentStatus === "STOP") {
    return JSON.stringify({
      success: false,
      message: "Le restaurant est actuellement fermé et ne prend plus de commandes.",
    });
  }

  if (!args.items || args.items.length === 0) {
    return JSON.stringify({
      success: false,
      message: "La commande ne contient aucun article.",
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
  const pickupTime = parsePickupTime(args.pickup_time);

  const mergedCustomerPhone =
    (args.customer_phone?.trim() && normalizeFrenchPhoneNumber(args.customer_phone.trim())) ||
    (options?.callerPhone?.trim() && normalizeFrenchPhoneNumber(options.callerPhone.trim())) ||
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

  logger.info("Commande créée via Vapi", {
    orderId: createdOrder.id,
    orderNumber,
    restaurantId: restaurant.id,
    customerName: args.customer_name,
    itemCount: args.items.length,
    totalAmount,
  });

  if (process.env.TWILIO_ORDER_CONFIRMATION_SMS !== "false") {
    const fromRaw = process.env.TWILIO_SMS_FROM?.trim() || restaurant.twilioPhoneNumber?.trim();
    const toRaw = args.customer_phone?.trim() || options?.callerPhone?.trim();
    if (fromRaw && toRaw) {
      await trySendOrderConfirmationSms({
        toRaw,
        fromRaw,
        restaurantName: restaurant.name,
        orderNumber,
        lines: itemsForDb.map((item) => {
          const lineEuros = (item.totalPrice / 100).toFixed(2);
          return `${item.productName} x${item.quantity} — ${lineEuros} €`;
        }),
        totalEuros: (totalAmount / 100).toFixed(2),
      });
    }
  }

  return JSON.stringify({
    success: true,
    order_number: orderNumber,
    message: `La commande ${orderNumber} a été enregistrée avec succès.`,
  });
}

function extractAssistantId(body: VapiWebhookBody): string | null {
  return (
    body.message.call?.assistantId ||
    body.message.call?.assistant?.id ||
    body.message.assistant?.id ||
    body.message.assistantId ||
    null
  );
}

function extractBearerToken(authorization: string | null): string | undefined {
  if (!authorization) {
    return undefined;
  }
  const m = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return m?.[1]?.trim();
}

async function verifyWebhookSignature(request: Request): Promise<boolean> {
  if (process.env.VAPI_WEBHOOK_DISABLE_AUTH === "true") {
    logger.warn("VAPI_WEBHOOK_DISABLE_AUTH=true — authentification webhook désactivée (ne pas utiliser en prod)");
    return true;
  }

  const secret = process.env.VAPI_WEBHOOK_SECRET?.trim();

  // En production, le secret est obligatoire (sinon 401 systématique côté Vapi).
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      logger.error(
        "VAPI_WEBHOOK_SECRET manquant en production — le webhook renvoie 401. Définir le secret sur Vercel et le même sur Vapi (tool server ou credential)."
      );
      return false;
    }
    logger.warn("VAPI_WEBHOOK_SECRET non défini - webhook accepté (dev uniquement)");
    return true;
  }

  const xVapiSecret = request.headers.get("x-vapi-secret")?.trim();
  const xVapiSignature = request.headers.get("x-vapi-signature")?.trim();
  const bearer = extractBearerToken(request.headers.get("authorization"));

  const candidates = [xVapiSecret, xVapiSignature, bearer].filter(
    (v): v is string => typeof v === "string" && v.length > 0
  );

  if (candidates.length === 0) {
    logger.warn(
      "Webhook Vapi : aucun en-tête d’auth (x-vapi-secret, x-vapi-signature, Authorization Bearer). Vérifier que le tool submit_order a le même secret que VAPI_WEBHOOK_SECRET."
    );
    return false;
  }

  try {
    const ok = candidates.some((c) => c === secret);
    if (!ok) {
      logger.warn("Webhook Vapi : secret reçu ne correspond pas à VAPI_WEBHOOK_SECRET");
    }
    return ok;
  } catch (error) {
    logger.error("Erreur vérification signature webhook", error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

function getRawToolParameters(toolCall: ToolCall): unknown {
  if (toolCall.parameters !== undefined) {
    return toolCall.parameters;
  }
  if (toolCall.arguments !== undefined) {
    return toolCall.arguments;
  }
  return {};
}

async function processSubmitOrderToolCall(
  body: VapiWebhookBody,
  toolCall: ToolCall
): Promise<{ name: string; toolCallId: string; result: string }> {
  const assistantId = extractAssistantId(body);
  if (!assistantId) {
    logger.warn("Assistant ID manquant dans tool call", {
      toolCallId: toolCall.id,
      body: JSON.stringify(body, null, 2),
    });
    return {
      name: toolCall.name,
      toolCallId: toolCall.id,
      result: JSON.stringify({ success: false, message: "Assistant non identifié" }),
    };
  }

  try {
    const rawParams = getRawToolParameters(toolCall);
    logger.info("Traitement submit_order", {
      assistantId,
      parameters: JSON.stringify(rawParams),
    });

    const normalized = normalizeSubmitOrderPayload(rawParams);
    if (!normalized) {
      return {
        name: toolCall.name,
        toolCallId: toolCall.id,
        result: JSON.stringify({
          success: false,
          message:
            "Données de commande invalides : prénom/nom client et au moins un article avec libellé sont requis (submit_order).",
        }),
      };
    }

    const result = await handleSubmitOrder(assistantId, normalized, {
      callerPhone: extractCallerPhone(body),
    });

    logger.info("submit_order réussi", {
      toolCallId: toolCall.id,
      result,
    });

    return {
      name: toolCall.name,
      toolCallId: toolCall.id,
      result,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Erreur submit_order", new Error(errorMessage), {
      toolCallId: toolCall.id,
      parameters: JSON.stringify(getRawToolParameters(toolCall)),
    });

    return {
      name: toolCall.name,
      toolCallId: toolCall.id,
      result: JSON.stringify({
        success: false,
        message: `Erreur : ${errorMessage}`,
      }),
    };
  }
}

async function handleToolCalls(body: VapiWebhookBody): Promise<{ results: Array<{ name: string; toolCallId: string; result: string }> }> {
  const toolCalls =
    body.message.toolCallList ||
    body.message.toolWithToolCallList?.map((t) => ({
      id: t.toolCall.id,
      name: t.name,
      parameters: t.toolCall.parameters,
      arguments: t.toolCall.arguments,
    })) ||
    [];

  logger.info("Tool calls reçus", {
    count: toolCalls.length,
    tools: toolCalls.map((t) => t.name),
  });

  const results = [];

  for (const toolCall of toolCalls) {
    if (isSubmitOrderToolName(toolCall.name)) {
      const result = await processSubmitOrderToolCall(body, toolCall);
      results.push(result);
    } else {
      logger.warn("Tool call non géré", { name: toolCall.name, id: toolCall.id });
      results.push({
        name: toolCall.name,
        toolCallId: toolCall.id,
        result: JSON.stringify({ success: false, message: "Tool non implémenté" }),
      });
    }
  }

  return { results };
}

export async function POST(request: Request) {
  try {
    // Vérification de sécurité du webhook
    if (!(await verifyWebhookSignature(request))) {
      logger.warn("Webhook Vapi rejeté: signature invalide ou manquante");
      return NextResponse.json(
        {
          error: "Unauthorized",
          hint:
            "Vercel: définir VAPI_WEBHOOK_SECRET. Vapi: même valeur sur le serveur du tool (secret ou credential X-Vapi-Secret / Bearer). Voir docs/VAPI_WEBHOOK.md",
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as VapiWebhookBody;
    const messageType = body.message?.type;

    logger.info("Webhook Vapi reçu", {
      type: messageType,
      assistantId: extractAssistantId(body),
      callId: body.message.call?.id,
    });

    if (isToolCallsPayload(body)) {
      const { results } = await handleToolCalls(body);
      logger.info("Réponse webhook tool-calls", { resultsCount: results.length, declaredType: messageType });
      return NextResponse.json({ results }, { status: 200 });
    }

    if (messageType === "end-of-call-report") {
      logger.info("Rapport de fin d'appel Vapi reçu", {
        callId: body.message.call?.id,
      });
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    logger.info("Message type non géré", { type: messageType });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Erreur webhook Vapi", error instanceof Error ? error : new Error(errorMessage));

    return NextResponse.json(
      {
        results: [
          {
            name: "submit_order",
            toolCallId: "unknown",
            result: JSON.stringify({
              success: false,
              message: `Erreur serveur : ${errorMessage}`,
            }),
          },
        ],
      },
      { status: 500 }
    );
  }
}
