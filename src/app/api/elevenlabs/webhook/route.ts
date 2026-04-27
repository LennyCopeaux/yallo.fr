import { db } from "@/db";
import { orders, orderItems, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { pushVoiceOrderToHubrise } from "@/lib/services/hubrise";
import { normalizeSubmitOrderPayload } from "@/lib/services/vapi-submit-order-args";
import { trySendOrderConfirmationSms } from "@/lib/services/twilio-sms";
import { normalizeFrenchPhoneNumber } from "@/lib/utils";

export const runtime = "nodejs";

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

interface ElevenLabsWebhookBody {
  agent_id: string;
  conversation_id?: string;
  caller_id?: string;
  tool_name?: string;
  tool_call_id?: string;
  parameters?: Record<string, unknown>;
  /** ElevenLabs wraps tool calls in this shape for server tools */
  tool_calls?: Array<{
    tool_call_id: string;
    tool_name: string;
    parameters: Record<string, unknown>;
  }>;
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

async function findRestaurantByAgentId(agentId: string) {
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.elevenLabsAgentId, agentId))
    .limit(1);
  return restaurant;
}

async function handleSubmitOrder(
  agentId: string,
  args: SubmitOrderArgs,
  options?: Readonly<{ callerPhone?: string }>
): Promise<string> {
  const restaurant = await findRestaurantByAgentId(agentId);
  if (!restaurant) {
    logger.error(
      "Restaurant introuvable pour l'agent ElevenLabs",
      new Error(`agentId: ${agentId}`)
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

  logger.info("Commande créée via ElevenLabs", {
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

function verifyWebhookSecret(request: Request): boolean {
  if (process.env.ELEVENLABS_WEBHOOK_DISABLE_AUTH === "true") {
    logger.warn(
      "ELEVENLABS_WEBHOOK_DISABLE_AUTH=true — authentification webhook désactivée (ne pas utiliser en prod)"
    );
    return true;
  }

  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET?.trim();

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      logger.error(
        "ELEVENLABS_WEBHOOK_SECRET manquant en production — le webhook renvoie 401"
      );
      return false;
    }
    logger.warn("ELEVENLABS_WEBHOOK_SECRET non défini - webhook accepté (dev uniquement)");
    return true;
  }

  const incoming = request.headers.get("x-elevenlabs-secret")?.trim();
  if (!incoming) {
    logger.warn("Webhook ElevenLabs : header x-elevenlabs-secret absent");
    return false;
  }

  const ok = incoming === secret;
  if (!ok) {
    logger.warn("Webhook ElevenLabs : secret reçu ne correspond pas à ELEVENLABS_WEBHOOK_SECRET");
  }
  return ok;
}

export async function POST(request: Request) {
  try {
    if (!verifyWebhookSecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ElevenLabsWebhookBody;

    logger.info("Webhook ElevenLabs reçu", {
      agentId: body.agent_id,
      conversationId: body.conversation_id,
      toolName: body.tool_name,
    });

    // ElevenLabs peut envoyer soit un seul tool_call à la racine,
    // soit un tableau tool_calls
    const toolCalls: Array<{ tool_call_id: string; tool_name: string; parameters: Record<string, unknown> }> = [];

    if (body.tool_calls && body.tool_calls.length > 0) {
      toolCalls.push(...body.tool_calls);
    } else if (body.tool_name && body.tool_call_id) {
      toolCalls.push({
        tool_call_id: body.tool_call_id,
        tool_name: body.tool_name,
        parameters: body.parameters ?? {},
      });
    }

    if (toolCalls.length === 0) {
      logger.info("Webhook ElevenLabs : pas de tool call à traiter");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const results = [];

    for (const toolCall of toolCalls) {
      if (toolCall.tool_name === "submit_order") {
        try {
          const normalized = normalizeSubmitOrderPayload(toolCall.parameters);
          if (!normalized) {
            results.push({
              type: "tool_result",
              tool_call_id: toolCall.tool_call_id,
              tool_result: JSON.stringify({
                success: false,
                message:
                  "Données de commande invalides : prénom/nom client et au moins un article avec libellé sont requis.",
              }),
            });
            continue;
          }

          logger.info("Traitement submit_order ElevenLabs", {
            agentId: body.agent_id,
            toolCallId: toolCall.tool_call_id,
          });

          const result = await handleSubmitOrder(body.agent_id, normalized, {
            callerPhone: body.caller_id,
          });

          results.push({
            type: "tool_result",
            tool_call_id: toolCall.tool_call_id,
            tool_result: result,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error("Erreur submit_order ElevenLabs", new Error(errorMessage), {
            toolCallId: toolCall.tool_call_id,
          });
          results.push({
            type: "tool_result",
            tool_call_id: toolCall.tool_call_id,
            tool_result: JSON.stringify({ success: false, message: `Erreur : ${errorMessage}` }),
          });
        }
      } else {
        logger.warn("Tool call ElevenLabs non géré", { name: toolCall.tool_name });
        results.push({
          type: "tool_result",
          tool_call_id: toolCall.tool_call_id,
          tool_result: JSON.stringify({ success: false, message: "Tool non implémenté" }),
        });
      }
    }

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    logger.error(
      "Erreur webhook ElevenLabs",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
