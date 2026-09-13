import { describe, it, expect } from "vitest";
import {
  evaluateSubscriptionAccess,
  isPaidSubscriptionStatus,
  describeSubscriptionBlock,
} from "@/lib/services/subscription";

describe("isPaidSubscriptionStatus", () => {
  it("accepts active and trialing", () => {
    expect(isPaidSubscriptionStatus("active")).toBe(true);
    expect(isPaidSubscriptionStatus("trialing")).toBe(true);
    expect(isPaidSubscriptionStatus("ACTIVE")).toBe(true);
  });

  it("rejects unpaid or unknown statuses", () => {
    expect(isPaidSubscriptionStatus("past_due")).toBe(false);
    expect(isPaidSubscriptionStatus("canceled")).toBe(false);
    expect(isPaidSubscriptionStatus("unpaid")).toBe(false);
    expect(isPaidSubscriptionStatus(null)).toBe(false);
    expect(isPaidSubscriptionStatus(undefined)).toBe(false);
    expect(isPaidSubscriptionStatus("")).toBe(false);
  });
});

describe("evaluateSubscriptionAccess", () => {
  it("blocks when there is no organization", () => {
    const access = evaluateSubscriptionAccess(null);

    expect(access.hasAccess).toBe(false);
    expect(access.reason).toBe("no_organization");
  });

  it("blocks an organization that never subscribed", () => {
    const access = evaluateSubscriptionAccess({
      stripeSubscriptionStatus: null,
      stripeCurrentPeriodEnd: null,
    });

    expect(access.hasAccess).toBe(false);
    expect(access.reason).toBe("never_subscribed");
  });

  it("blocks an organization whose subscription lapsed", () => {
    const access = evaluateSubscriptionAccess({
      stripeSubscriptionStatus: "past_due",
      stripeCurrentPeriodEnd: null,
    });

    expect(access.hasAccess).toBe(false);
    expect(access.reason).toBe("subscription_inactive");
    expect(access.status).toBe("past_due");
  });

  it("grants access when the subscription is active", () => {
    const periodEnd = new Date("2026-10-01T00:00:00.000Z");
    const access = evaluateSubscriptionAccess({
      stripeSubscriptionStatus: "active",
      stripeCurrentPeriodEnd: periodEnd,
    });

    expect(access.hasAccess).toBe(true);
    expect(access.reason).toBe("paid");
    expect(access.currentPeriodEnd).toBe(periodEnd);
  });

  it("grants access when the subscription is trialing", () => {
    const access = evaluateSubscriptionAccess({
      stripeSubscriptionStatus: "trialing",
      stripeCurrentPeriodEnd: null,
    });

    expect(access.hasAccess).toBe(true);
    expect(access.reason).toBe("paid");
  });

  it("grants access when Yallo enabled a manual override, even without Stripe", () => {
    const access = evaluateSubscriptionAccess({
      stripeSubscriptionStatus: null,
      stripeCurrentPeriodEnd: null,
      manualAccessEnabled: true,
    });

    expect(access.hasAccess).toBe(true);
    expect(access.reason).toBe("manual_access");
  });

  it("manual override wins over a cancelled subscription", () => {
    const access = evaluateSubscriptionAccess({
      stripeSubscriptionStatus: "canceled",
      stripeCurrentPeriodEnd: null,
      manualAccessEnabled: true,
    });

    expect(access.hasAccess).toBe(true);
    expect(access.reason).toBe("manual_access");
  });
});

describe("describeSubscriptionBlock", () => {
  it("explains a lapsed subscription", () => {
    const message = describeSubscriptionBlock({
      hasAccess: false,
      reason: "subscription_inactive",
      status: "past_due",
      currentPeriodEnd: null,
    });

    expect(message.title).toContain("plus actif");
  });

  it("invites a never-subscribed org to pick a plan", () => {
    const message = describeSubscriptionBlock({
      hasAccess: false,
      reason: "never_subscribed",
      status: null,
      currentPeriodEnd: null,
    });

    expect(message.title).toContain("abonnement");
  });
});
