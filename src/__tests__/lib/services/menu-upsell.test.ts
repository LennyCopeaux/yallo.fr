import { describe, it, expect } from "vitest";
import { findUpsellCandidates } from "@/lib/services/menu-upsell";

describe("findUpsellCandidates", () => {
  it("returns nothing when the menu only has mains", () => {
    expect(
      findUpsellCandidates({
        categories: [
          {
            name: "Pizzas gourmandes",
            products: [{ name: "4 fromages", skus: [{ ref: "p1", name: "Normale", price: "12" }] }],
          },
        ],
      })
    ).toEqual({ hasAny: false, suggestions: [] });
  });

  it("lists orderable drinks and desserts only", () => {
    expect(
      findUpsellCandidates({
        categories: [
          {
            name: "Pizzas",
            products: [{ name: "4 fromages", skus: [{ ref: "p1", name: "Normale", price: "12" }] }],
          },
          {
            name: "Boissons",
            products: [
              { name: "Coca 33cl", skus: [{ ref: "c1", name: "33cl", price: "2" }] },
              { name: "Eau", skus: [] },
            ],
          },
          {
            name: "Desserts",
            products: [{ name: "Tiramisu", skus: [{ ref: "d1", name: "Part", price: "4" }] }],
          },
        ],
      })
    ).toEqual({ hasAny: true, suggestions: ["Coca 33cl", "Tiramisu"] });
  });

  it("does not match a keyword hidden inside another word", () => {
    expect(
      findUpsellCandidates({
        categories: [
          {
            name: "Homard Thermidor",
            products: [{ name: "Thermidor", skus: [{ ref: "t1", name: "Plat", price: "28" }] }],
          },
        ],
      })
    ).toEqual({ hasAny: false, suggestions: [] });
  });
});
