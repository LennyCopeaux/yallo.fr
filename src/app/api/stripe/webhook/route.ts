import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { logger } from "@/lib/logger";
import { getStripeServerClient } from "@/lib/services/stripe";
import {
  extractStripeSubscriptionSyncPayload,
  getStripeWebhookSecret,
  isRestaurantActiveFromStripeStatus,
} from "@/lib/services/stripe-webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripeSignature = request.headers.get("stripe-signature");
  if (!stripeSignature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripeServerClient();

  try {
    const event = stripe.webhooks.constructEvent(payload, stripeSignature, getStripeWebhookSecret());
    const syncPayload = extractStripeSubscriptionSyncPayload(event);

    if (!syncPayload) {
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    const [restaurantByCustomerId] = await db
      .select({ id: restaurants.id })
      .from(restaurants)
      .where(eq(restaurants.stripeCustomerId, syncPayload.customerId))
      .limit(1);

    const targetRestaurantId = restaurantByCustomerId?.id ?? syncPayload.restaurantId;

    if (!targetRestaurantId) {
      logger.warn("Stripe webhook received but no matching restaurant found", {
        eventType: syncPayload.eventType,
        customerId: syncPayload.customerId,
        subscriptionId: syncPayload.subscriptionId,
      });
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    const isActive = isRestaurantActiveFromStripeStatus(syncPayload.subscriptionStatus);

    const startDateStr = syncPayload.startDate?.toISOString().split("T")[0] ?? new Date().toISOString().split("T")[0];

    await db
      .update(restaurants)
      .set({
        stripeCustomerId: syncPayload.customerId,
        stripeSubscriptionId: syncPayload.subscriptionId,
        stripeSubscriptionStatus: syncPayload.subscriptionStatus,
        stripePriceId: syncPayload.planId ?? syncPayload.priceId,
        stripeCurrentPeriodEnd: syncPayload.currentPeriodEnd,
        ...(isActive && {
          billingStartDate: sql`COALESCE(${restaurants.billingStartDate}, ${startDateStr})`,
        }),
        isActive,
        status: isActive ? "active" : "suspended",
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, targetRestaurantId));

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error("Stripe webhook error", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }
}
