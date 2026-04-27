import { describe, it, expect } from "vitest";
import { normalizeSubmitOrderPayload } from "@/lib/services/submit-order-args";

describe("normalizeSubmitOrderPayload", () => {
  it("returns null without customer_name", () => {
    expect(
      normalizeSubmitOrderPayload({
        items: [{ product_name: "Pizza", quantity: 1, unit_price: 10 }],
      })
    ).toBeNull();
  });

  it("returns null without items", () => {
    expect(normalizeSubmitOrderPayload({ customer_name: "Jean" })).toBeNull();
  });

  it("normalizes snake_case payload", () => {
    const p = normalizeSubmitOrderPayload({
      customer_name: "Marie",
      items: [{ product_name: "Tacos", quantity: 2, unit_price: 8.5, options: "Sauce algérienne" }],
    });
    expect(p).not.toBeNull();
    expect(p?.customer_name).toBe("Marie");
    expect(p?.items).toHaveLength(1);
    expect(p?.items[0]?.product_name).toBe("Tacos");
    expect(p?.items[0]?.quantity).toBe(2);
    expect(p?.items[0]?.unit_price).toBe(8.5);
    expect(p?.items[0]?.options).toBe("Sauce algérienne");
  });

  it("parses JSON string arguments", () => {
    const raw = JSON.stringify({
      customerName: "Paul",
      items: [{ productName: "Burger", qty: 1, unitPrice: 12 }],
    });
    const p = normalizeSubmitOrderPayload(raw);
    expect(p?.customer_name).toBe("Paul");
    expect(p?.items[0]?.product_name).toBe("Burger");
  });
});
