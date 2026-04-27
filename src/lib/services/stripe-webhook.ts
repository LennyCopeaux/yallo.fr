import Stripe from "stripe";
import { z } from "zod";

const SUBSCRIPTION_STATUSES_THAT_KEEP_ACTIVE = new Set(["active", "trialing"]);

const subscriptionPayloadSchema = z.object({
  eventType: z.enum([
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ]),
  customerId: z.string().min(1, "customerId is required"),
  subscriptionId: z.string().min(1, "subscriptionId is required"),
  subscriptionStatus: z.string().min(1, "subscriptionStatus is required"),
  priceId: z.string().nullable(),
  planId: z.string().nullable(),
  currentPeriodEnd: z.date().nullable(),
  startDate: z.date().nullable(),
  restaurantId: z.string().uuid().nullable(),
});

export type StripeSubscriptionSyncPayload = z.infer<typeof subscriptionPayloadSchema>;

function getCurrentPeriodEndDate(unixTimestamp: number | null | undefined): Date | null {
  if (!unixTimestamp) {
    return null;
  }
  return new Date(unixTimestamp * 1000);
}

function getPriceIdFromSubscription(subscription: Stripe.Subscription): string | null {
  const firstItem = subscription.items.data[0];
  if (!firstItem) {
    return null;
  }
  return firstItem.price.id;
}

function getCurrentPeriodEndFromSubscription(
  subscription: Stripe.Subscription
): number | null | undefined {
  const firstItem = subscription.items.data[0];
  return firstItem?.current_period_end;
}

function parseCheckoutSessionCompleted(
  event: Stripe.Event,
  session: Stripe.Checkout.Session
): StripeSubscriptionSyncPayload {
  if (session.mode !== "subscription") {
    throw new Error("Stripe checkout.session.completed ignored: mode is not subscription");
  }

  if (typeof session.customer !== "string") {
    throw new Error("Stripe checkout.session.completed payload missing string customer id");
  }

  if (typeof session.subscription !== "string") {
    throw new Error("Stripe checkout.session.completed payload missing string subscription id");
  }

  const restaurantId = session.metadata?.restaurantId ?? null;

  return subscriptionPayloadSchema.parse({
    eventType: event.type,
    customerId: session.customer,
    subscriptionId: session.subscription,
    subscriptionStatus: "active",
    priceId: null,
    planId: session.metadata?.planId ?? null,
    currentPeriodEnd: null,
    startDate: new Date(),
    restaurantId,
  });
}

function parseSubscriptionEvent(
  event: Stripe.Event,
  subscription: Stripe.Subscription
): StripeSubscriptionSyncPayload {
  if (typeof subscription.customer !== "string") {
    throw new Error(`Stripe ${event.type} payload missing string customer id`);
  }

  const restaurantId = subscription.metadata?.restaurantId ?? null;

  return subscriptionPayloadSchema.parse({
    eventType: event.type,
    customerId: subscription.customer,
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    priceId: getPriceIdFromSubscription(subscription),
    planId: subscription.metadata?.planId ?? null,
    currentPeriodEnd: getCurrentPeriodEndDate(
      getCurrentPeriodEndFromSubscription(subscription)
    ),
    startDate: subscription.start_date ? new Date(subscription.start_date * 1000) : null,
    restaurantId,
  });
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
  }
  return secret;
}

export function isRestaurantActiveFromStripeStatus(subscriptionStatus: string): boolean {
  return SUBSCRIPTION_STATUSES_THAT_KEEP_ACTIVE.has(subscriptionStatus);
}

export function extractStripeSubscriptionSyncPayload(
  event: Stripe.Event
): StripeSubscriptionSyncPayload | null {
  switch (event.type) {
    case "checkout.session.completed":
      return parseCheckoutSessionCompleted(event, event.data.object as Stripe.Checkout.Session);
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return parseSubscriptionEvent(event, event.data.object as Stripe.Subscription);
    default:
      return null;
  }
}
