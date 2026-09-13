import { describe, it, expect } from "vitest";
import type Stripe from "stripe";
import {
  buildUsageDescription,
  computeUsageInvoiceAmount,
  getCallRateCentsPerMinute,
  isBillableUsageInvoice,
} from "@/lib/services/call-usage-billing";

describe("computeUsageInvoiceAmount", () => {
  it("bills nothing without usage", () => {
    expect(computeUsageInvoiceAmount(0, 17)).toEqual({ minutes: 0, amountCents: 0 });
  });

  it("rounds any started minute up", () => {
    expect(computeUsageInvoiceAmount(61, 17)).toEqual({ minutes: 2, amountCents: 34 });
    expect(computeUsageInvoiceAmount(1, 17)).toEqual({ minutes: 1, amountCents: 17 });
  });

  it("bills exact minutes without extra", () => {
    expect(computeUsageInvoiceAmount(600, 15)).toEqual({ minutes: 10, amountCents: 150 });
  });

  it("bills nothing when the rate is zero", () => {
    expect(computeUsageInvoiceAmount(600, 0)).toEqual({ minutes: 0, amountCents: 0 });
  });

  it("ignores negative durations", () => {
    expect(computeUsageInvoiceAmount(-30, 17)).toEqual({ minutes: 0, amountCents: 0 });
  });
});

describe("getCallRateCentsPerMinute", () => {
  it("uses the rate of the subscribed plan", () => {
    expect(getCallRateCentsPerMinute("starter")).toBe(19);
    expect(getCallRateCentsPerMinute("essential")).toBe(17);
    expect(getCallRateCentsPerMinute("infinity")).toBe(15);
  });

  it("falls back to the first plan for an unknown plan", () => {
    expect(getCallRateCentsPerMinute(null)).toBe(19);
    expect(getCallRateCentsPerMinute("price_unknown")).toBe(19);
  });
});

function invoice(overrides: Partial<Stripe.Invoice>): Stripe.Invoice {
  return {
    status: "draft",
    billing_reason: "subscription_cycle",
    ...overrides,
  } as Stripe.Invoice;
}

describe("isBillableUsageInvoice", () => {
  it("accepts a draft subscription invoice", () => {
    expect(isBillableUsageInvoice(invoice({}))).toBe(true);
    expect(isBillableUsageInvoice(invoice({ billing_reason: "subscription_create" }))).toBe(true);
  });

  it("refuses an invoice already finalized", () => {
    expect(isBillableUsageInvoice(invoice({ status: "open" }))).toBe(false);
    expect(isBillableUsageInvoice(invoice({ status: "paid" }))).toBe(false);
  });

  it("refuses a one-off invoice unrelated to a subscription", () => {
    expect(isBillableUsageInvoice(invoice({ billing_reason: "manual" }))).toBe(false);
    expect(isBillableUsageInvoice(invoice({ billing_reason: null }))).toBe(false);
  });
});

describe("buildUsageDescription", () => {
  it("shows minutes and rate in euros", () => {
    expect(buildUsageDescription(42, 17)).toBe("Minutes d'appel IA — 42 min à 0,17 €/min");
  });
});
