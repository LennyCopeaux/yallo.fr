import { describe, it, expect } from "vitest";
import { buildSizeSummaryBlock } from "@/lib/services/menu-sizes";

const pizza = (nom: string) => ({
  nom,
  tarifs: [
    { prix: "8.50", label: "26 cm" },
    { prix: "11.50", label: "33 cm" },
    { prix: "15.50", label: "40 cm" },
  ],
});

describe("buildSizeSummaryBlock", () => {
  it("returns nothing for an unreadable menu so the prompt makes no claim", () => {
    expect(buildSizeSummaryBlock(null)).toBe("");
    expect(buildSizeSummaryBlock({ categories: [], option_lists: [] })).toBe("");
  });

  it("names the sized categories and states that the others have no size (photo format)", () => {
    const block = buildSizeSummaryBlock({
      categories: ["Salades", "Pizzas", "Boissons"],
      donnees_menu: [
        { categorie: "Salades", articles: [{ nom: "La Niçoise", tarifs: [{ prix: "10.90", label: "" }] }] },
        { categorie: "Pizzas", articles: [pizza("La Marguerite"), pizza("La Reine")] },
        { categorie: "Boissons", articles: [{ nom: "Sodas (33cl)", tarifs: [{ prix: "2", label: "" }] }] },
      ],
    });

    expect(block).toContain("LISTE FERMÉE DES TAILLES");
    expect(block).toContain("Pizzas : tous les articles existent en 26 cm, 33 cm, 40 cm");
    expect(block).toContain("Salades, Boissons : AUCUN article n'a de taille");
    expect(block).toContain("même juste après une pizza");
  });

  it("lists individual articles when only some of a category have sizes", () => {
    const block = buildSizeSummaryBlock({
      categories: ["Pizzas"],
      donnees_menu: [
        {
          categorie: "Pizzas",
          articles: [pizza("La Marguerite"), { nom: "Calzone unique", tarifs: [{ prix: "12", label: "" }] }],
        },
      ],
    });

    expect(block).toContain("Pizzas : seuls La Marguerite (26 cm, 33 cm, 40 cm) ont une taille");
  });

  it("reads the structured format (skus) as well", () => {
    const block = buildSizeSummaryBlock({
      categories: [
        {
          name: "Tacos",
          products: [
            { name: "Tacos", skus: [{ ref: "m", name: "M", price: "7" }, { ref: "l", name: "L", price: "9" }] },
          ],
        },
        { name: "Boissons", products: [{ name: "Coca", skus: [{ ref: "c", name: "33cl", price: "2" }] }] },
      ],
      option_lists: [],
    });

    expect(block).toContain("Tacos : tous les articles existent en M, L");
    expect(block).toContain("Boissons : AUCUN article n'a de taille");
  });

  it("says no article has a size when the whole menu is single-price", () => {
    const block = buildSizeSummaryBlock({
      categories: ["Burgers"],
      donnees_menu: [{ categorie: "Burgers", articles: [{ nom: "Le Végé", tarifs: [{ prix: "11.90", label: "" }] }] }],
    });

    expect(block).toContain("aucun article de ce menu n'a de taille");
  });
});
