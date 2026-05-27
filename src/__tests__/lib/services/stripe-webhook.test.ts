import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import {
  extractStripeSubscriptionSyncPayload,
  isRestaurantActiveFromStripeStatus,
} from "@/lib/services/stripe-webhook";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createEvent(event: any): Stripe.Event {
  return {
    id: "evt_test",
    object: "event",
    api_version: "2026-03-25.dahlia",
    created: 1_734_000_000,
    data: { object: {} },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: "customer.subscription.updated",
    ...event,
  } as unknown as Stripe.Event;
}

describe("extractStripeSubscriptionSyncPayload", () => {
  it("extracts and validates customer.subscription payload", () => {
    const event = createEvent({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          status: "active",
          items: {
            data: [{ price: { id: "price_123" }, current_period_end: 1_734_111_111 }],
          },
          metadata: {
            restaurantId: "550e8400-e29b-41d4-a716-446655440000",
          },
        },
      },
    });

    const payload = extractStripeSubscriptionSyncPayload(event);
    expect(payload).not.toBeNull();
    expect(payload?.customerId).toBe("cus_123");
    expect(payload?.subscriptionId).toBe("sub_123");
    expect(payload?.subscriptionStatus).toBe("active");
    expect(payload?.priceId).toBe("price_123");
    expect(payload?.restaurantId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(payload?.currentPeriodEnd).toBeInstanceOf(Date);
  });

  it("extracts checkout.session.completed subscription payload", () => {
    const event = createEvent({
      type: "checkout.session.completed",
      data: {
        object: {
          mode: "subscription",
          customer: "cus_456",
          subscription: "sub_456",
          metadata: {
            restaurantId: "550e8400-e29b-41d4-a716-446655440001",
          },
        },
      },
    });

    const payload = extractStripeSubscriptionSyncPayload(event);
    expect(payload).not.toBeNull();
    expect(payload?.eventType).toBe("checkout.session.completed");
    expect(payload?.customerId).toBe("cus_456");
    expect(payload?.subscriptionId).toBe("sub_456");
    expect(payload?.subscriptionStatus).toBe("active");
  });

  it("returns null for unrelated Stripe events", () => {
    const event = createEvent({
      type: "invoice.created",
      data: {
        object: {
          id: "in_123",
        },
      },
    });

    const payload = extractStripeSubscriptionSyncPayload(event);
    expect(payload).toBeNull();
  });

  it("rejects invalid payload when metadata restaurantId is malformed", () => {
    const event = createEvent({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_789",
          customer: "cus_789",
          status: "active",
          current_period_end: 1_734_222_222,
          items: {
            data: [{ price: { id: "price_789" } }],
          },
          metadata: {
            restaurantId: "invalid-restaurant-id",
          },
        },
      },
    });

    expect(() => extractStripeSubscriptionSyncPayload(event)).toThrowError();
  });
});

describe("isRestaurantActiveFromStripeStatus", () => {
  it("activates restaurant for active and trialing subscriptions", () => {
    expect(isRestaurantActiveFromStripeStatus("active")).toBe(true);
    expect(isRestaurantActiveFromStripeStatus("trialing")).toBe(true);
  });

  it("suspends restaurant for unpaid statuses", () => {
    expect(isRestaurantActiveFromStripeStatus("past_due")).toBe(false);
    expect(isRestaurantActiveFromStripeStatus("canceled")).toBe(false);
    expect(isRestaurantActiveFromStripeStatus("unpaid")).toBe(false);
  });
});
