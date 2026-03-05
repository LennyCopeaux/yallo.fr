import { db } from "@/db";
import { orders, orderItems, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

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
  parameters: Record<string, unknown>;
}

interface VapiWebhookBody {
  message: {
    type: string;
    call?: {
      id?: string;
      phoneNumber?: { number?: string };
      assistantId?: string;
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
  args: SubmitOrderArgs
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
    const unitPriceCents = Math.round(item.unit_price * 100);
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

  const [createdOrder] = await db
    .insert(orders)
    .values({
      restaurantId: restaurant.id,
      orderNumber,
      customerName: args.customer_name || null,
      customerPhone: args.customer_phone || null,
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

  logger.info("Commande créée via Vapi", {
    orderId: createdOrder.id,
    orderNumber,
    restaurantId: restaurant.id,
    customerName: args.customer_name,
    itemCount: args.items.length,
    totalAmount,
  });

  return JSON.stringify({
    success: true,
    order_number: orderNumber,
    message: `La commande ${orderNumber} a été enregistrée avec succès.`,
  });
}

function extractAssistantId(body: VapiWebhookBody): string | null {
  return (
    body.message.call?.assistantId ||
    body.message.assistant?.id ||
    body.message.assistantId ||
    null
  );
}

async function verifyWebhookSignature(request: Request): Promise<boolean> {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  
  // En production, le secret est obligatoire
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      logger.error("VAPI_WEBHOOK_SECRET manquant en production");
      return false;
    }
    // En développement, on accepte sans secret pour faciliter les tests
    logger.warn("VAPI_WEBHOOK_SECRET non défini - webhook accepté (dev uniquement)");
    return true;
  }

  // Vapi peut envoyer la signature dans différents headers selon la version
  // Vérification avec x-vapi-signature ou authorization header
  const signature = request.headers.get("x-vapi-signature") || 
                    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!signature) {
    logger.warn("Signature webhook Vapi manquante dans les headers");
    return false;
  }

  // Si Vapi utilise HMAC-SHA256, on devrait vérifier avec le body
  // Pour l'instant, vérification simple avec le secret
  try {
    // Vérification basique: le secret doit correspondre
    // En production, utiliser crypto.createHmac pour vérifier la signature complète
    return signature === secret || signature.startsWith(secret);
  } catch (error) {
    logger.error("Erreur vérification signature webhook", error instanceof Error ? error : new Error(String(error)));
    return false;
  }
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
    logger.info("Traitement submit_order", {
      assistantId,
      parameters: JSON.stringify(toolCall.parameters),
    });

    const result = await handleSubmitOrder(
      assistantId,
      toolCall.parameters as unknown as SubmitOrderArgs
    );

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
      parameters: JSON.stringify(toolCall.parameters),
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
    })) ||
    [];

  logger.info("Tool calls reçus", {
    count: toolCalls.length,
    tools: toolCalls.map((t) => t.name),
  });

  const results = [];

  for (const toolCall of toolCalls) {
    if (toolCall.name === "submit_order") {
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
        { error: "Unauthorized" },
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

    if (messageType === "tool-calls") {
      const { results } = await handleToolCalls(body);
      logger.info("Réponse webhook tool-calls", { resultsCount: results.length });
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
