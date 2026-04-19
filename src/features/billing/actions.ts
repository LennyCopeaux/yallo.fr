"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { getStripeServerClient } from "@/lib/services/stripe";

const DEFAULT_SUBSCRIPTION_AMOUNT_CENTS = 9900;
const DEFAULT_SUBSCRIPTION_CURRENCY = "eur";
const DEFAULT_SUBSCRIPTION_NAME = "Yallo - Abonnement Restaurant";

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

export async function createStripeCheckoutSessionForRestaurant(): Promise<BillingActionResult> {
  try {
    const user = await requireAuth();
    const restaurant = await getOwnerRestaurant(user.id);
    if (!restaurant) {
      return { success: false, error: "Aucun restaurant associé à ce compte." };
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
            currency: DEFAULT_SUBSCRIPTION_CURRENCY,
            unit_amount: DEFAULT_SUBSCRIPTION_AMOUNT_CENTS,
            recurring: { interval: "month" },
            product_data: {
              name: DEFAULT_SUBSCRIPTION_NAME,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?billing=success`,
      cancel_url: `${appUrl}/dashboard?billing=cancel`,
      metadata: {
        restaurantId: restaurant.id,
      },
      subscription_data: {
        metadata: {
          restaurantId: restaurant.id,
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
