import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { organizations, restaurants } from "@/db/schema";
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

    // Résolution de l'organisation cible
    // Priorité 1 : trouver l'org par stripeCustomerId (la plus fiable)
    // Priorité 2 : organizationId en metadata (nouveaux checkouts)
    // Priorité 3 : restaurantId en metadata (anciens checkouts — rétrocompat)
    let targetOrgId: string | null = null;

    const [orgByCustomer] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.stripeCustomerId, syncPayload.customerId))
      .limit(1);

    if (orgByCustomer) {
      targetOrgId = orgByCustomer.id;
    } else if (syncPayload.organizationId) {
      targetOrgId = syncPayload.organizationId;
    } else if (syncPayload.restaurantId) {
      // Rétrocompat : chercher l'org rattachée au restaurant
      const [restaurantWithOrg] = await db
        .select({ organizationId: restaurants.organizationId })
        .from(restaurants)
        .where(eq(restaurants.id, syncPayload.restaurantId))
        .limit(1);
      targetOrgId = restaurantWithOrg?.organizationId ?? null;
    }

    if (!targetOrgId) {
      logger.warn("Stripe webhook received but no matching organization found", {
        eventType: syncPayload.eventType,
        customerId: syncPayload.customerId,
        subscriptionId: syncPayload.subscriptionId,
      });
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    const isActive = isRestaurantActiveFromStripeStatus(syncPayload.subscriptionStatus);
    const startDateStr = syncPayload.startDate?.toISOString().split("T")[0] ?? new Date().toISOString().split("T")[0];

    // Mettre à jour l'organisation
    await db
      .update(organizations)
      .set({
        stripeCustomerId: syncPayload.customerId,
        stripeSubscriptionId: syncPayload.subscriptionId,
        stripeSubscriptionStatus: syncPayload.subscriptionStatus,
        stripePriceId: syncPayload.planId ?? syncPayload.priceId,
        stripeCurrentPeriodEnd: syncPayload.currentPeriodEnd,
        ...(isActive && {
          billingStartDate: sql`COALESCE(${organizations.billingStartDate}, ${startDateStr})`,
        }),
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, targetOrgId));

    // Propager isActive + status sur tous les restaurants de l'organisation
    await db
      .update(restaurants)
      .set({
        isActive,
        status: isActive ? "active" : "suspended",
        updatedAt: new Date(),
      })
      .where(eq(restaurants.organizationId, targetOrgId));

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error("Stripe webhook error", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }
}
