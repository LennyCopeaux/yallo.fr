"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { getStripeServerClient } from "@/lib/services/stripe";
import { SUBSCRIPTION_PLANS, type PlanId } from "./plans";

export type BillingActionResult = {
  success: boolean;
  error?: string;
  data?: {
    checkoutUrl: string;
  };
};

function getBaseUrlFromHeaders(allHeaders: Headers): string {
  const forwardedProto = allHeaders.get("x-forwarded-proto");
  const host = allHeaders.get("x-forwarded-host") ?? allHeaders.get("host");
  if (!host) {
    return "http://localhost:3000";
  }
  const protocol = forwardedProto ?? "https";
  return `${protocol}://${host}`;
}

async function getOwnerRestaurant(ownerId: string) {
  const [restaurant] = await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      stripeCustomerId: restaurants.stripeCustomerId,
    })
    .from(restaurants)
    .where(eq(restaurants.ownerId, ownerId))
    .limit(1);

  return restaurant ?? null;
}

export async function createStripeCheckoutSessionForRestaurant(
  planId: PlanId = "essential"
): Promise<BillingActionResult> {
  try {
    const user = await requireAuth();
    const restaurant = await getOwnerRestaurant(user.id);
    if (!restaurant) {
      return { success: false, error: "Aucun restaurant associé à ce compte." };
    }

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return { success: false, error: "Plan non trouvé." };
    }

    const stripe = getStripeServerClient();

    let stripeCustomerId = restaurant.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: restaurant.name,
        metadata: {
          restaurantId: restaurant.id,
        },
      });
      stripeCustomerId = customer.id;

      await db
        .update(restaurants)
        .set({
          stripeCustomerId,
          updatedAt: new Date(),
        })
        .where(eq(restaurants.id, restaurant.id));
    }

    const requestHeaders = await headers();
    const appUrl = getBaseUrlFromHeaders(requestHeaders);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: plan.amountCents,
            recurring: { interval: "month" },
            product_data: {
              name: `Yallo ${plan.name}`,
              description: plan.description,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/billing?billing=success`,
      cancel_url: `${appUrl}/dashboard/billing?billing=cancel`,
      metadata: {
        restaurantId: restaurant.id,
        planId: plan.id,
      },
      subscription_data: {
        metadata: {
          restaurantId: restaurant.id,
          planId: plan.id,
        },
      },
    });

    if (!session.url) {
      return { success: false, error: "Stripe n'a pas retourné d'URL de paiement." };
    }

    return {
      success: true,
      data: {
        checkoutUrl: session.url,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la création du checkout Stripe.",
    };
  }
}

export async function createStripePortalSession(): Promise<BillingActionResult> {
  try {
    const user = await requireAuth();
    const restaurant = await getOwnerRestaurant(user.id);
    if (!restaurant) {
      return { success: false, error: "Aucun restaurant associé à ce compte." };
    }
    if (!restaurant.stripeCustomerId) {
      return { success: false, error: "Aucun abonnement Stripe actif." };
    }

    const stripe = getStripeServerClient();
    const requestHeaders = await headers();
    const appUrl = getBaseUrlFromHeaders(requestHeaders);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: restaurant.stripeCustomerId,
      return_url: `${appUrl}/dashboard/billing`,
    });

    return { success: true, data: { checkoutUrl: portalSession.url } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'ouverture du portail Stripe.",
    };
  }
}

