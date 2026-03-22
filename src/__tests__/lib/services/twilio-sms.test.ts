import { describe, it, expect } from "vitest";
import { buildOrderConfirmationSmsBody } from "@/lib/services/twilio-sms";

describe("buildOrderConfirmationSmsBody", () => {
  it("formats a short recap", () => {
    const text = buildOrderConfirmationSmsBody({
      restaurantName: "Les Pizzas",
      orderNumber: "#123",
      lines: ["Margherita x1 — 9.00 €"],
      totalEuros: "9.00",
    });
    expect(text).toContain("Les Pizzas");
    expect(text).toContain("#123");
    expect(text).toContain("Margherita");
    expect(text).toContain("9.00");
  });
});
