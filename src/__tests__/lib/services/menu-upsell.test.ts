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

  it("reads the photo-imported format (donnees_menu / articles / tarifs)", () => {
    expect(
      findUpsellCandidates({
        categories: ["Burgers", "Boissons", "Desserts"],
        donnees_menu: [
          {
            categorie: "Burgers",
            notes_de_section: ["Servis avec frites"],
            articles: [{ nom: "Le Montagnard", tarifs: [{ prix: "12.90", label: "" }], description: "" }],
          },
          {
            categorie: "Boissons",
            notes_de_section: [],
            articles: [
              { nom: "Sodas (33cl)", tarifs: [{ prix: "2", label: "" }], description: "Coca-Cola • Fanta" },
              { nom: "Redbull - Monster Energy", tarifs: [{ prix: "3.50", label: "" }], description: "" },
              { nom: "Carafe d'eau", tarifs: [{ prix: "", label: "" }], description: "" },
            ],
          },
          {
            categorie: "Desserts",
            notes_de_section: [],
            articles: [{ nom: "Tiramisu", tarifs: [{ prix: 3.5, label: "" }], description: "" }],
          },
        ],
        option_lists: [],
      })
    ).toEqual({ hasAny: true, suggestions: ["Sodas (33cl)", "Redbull - Monster Energy", "Tiramisu"] });
  });

  it("ignores a photo-imported menu whose complements have no price", () => {
    expect(
      findUpsellCandidates({
        categories: ["Boissons"],
        donnees_menu: [
          {
            categorie: "Boissons",
            articles: [{ nom: "Eau", tarifs: [{ prix: "", label: "" }] }],
          },
        ],
      })
    ).toEqual({ hasAny: false, suggestions: [] });
  });

  it("returns nothing for a menu that is not an object", () => {
    expect(findUpsellCandidates(null)).toEqual({ hasAny: false, suggestions: [] });
    expect(findUpsellCandidates("menu")).toEqual({ hasAny: false, suggestions: [] });
  });
});
