import { describe, it, expect } from "vitest";
import {
  buildOrderConfirmationSmsBody,
  buildOrderReadySmsBody,
} from "@/lib/services/twilio-sms";

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
    expect(text).toContain("Merci de votre commande !");
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });

  it("tells the customer the order is ready, without emojis", () => {
    const text = buildOrderReadySmsBody({
      restaurantName: "Chez Léon",
      orderNumber: "#642",
      customerName: "Pascal",
    });

    expect(text).toContain("Pascal, votre commande #642 est prête.");
    expect(text).toContain("Chez Léon");
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });
});
