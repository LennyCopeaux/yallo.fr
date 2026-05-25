import { db } from "@/db";
import { orders, orderItems, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { pushVoiceOrderToHubrise } from "@/lib/services/hubrise";
import { normalizeSubmitOrderPayload } from "@/lib/services/submit-order-args";
import { trySendOrderConfirmationSms } from "@/lib/services/twilio-sms";
import { normalizeFrenchPhoneNumber } from "@/lib/utils";

export const runtime = "nodejs";

interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * Format VAPI pour les tool calls (envoyé sur server URL configurée dans l'assistant).
 * https://docs.vapi.ai/tools/custom-tools
 */
interface VapiWebhookBody {
  message?: {
    type: string;
    toolCallList?: ToolCall[];
    call?: {
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

  if (process.env.TWILIO_ORDER_CONFIRMATION_SMS !== "false") {
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
      tools: toolCallList.map((t) => t.name),
    });

    const results: Array<{ toolCallId: string; result: string }> = [];

    for (const toolCall of toolCallList) {
      if (toolCall.name === "submit_order") {
        const normalized = normalizeSubmitOrderPayload(toolCall.arguments);
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
          result: JSON.stringify({ success: false, message: `Tool inconnu : ${toolCall.name}` }),
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
