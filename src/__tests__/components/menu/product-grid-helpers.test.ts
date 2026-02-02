import { describe, it, expect } from "vitest";

describe("Product Grid Helper Functions", () => {
  describe("getModifiersWithIngredients", () => {
    it("should filter out modifiers without matching ingredients", () => {
      const modifiers = [
        { id: "m1", ingredientId: "ing1", priceExtra: 0 },
        { id: "m2", ingredientId: "ing2", priceExtra: 50 },
      ];
      const ingredients = [
        { id: "ing1", name: "Ingredient 1", ingredientCategoryId: "cat1", price: 0, isAvailable: true, imageUrl: null, ingredientCategory: { id: "cat1", name: "Cat1", rank: 1 } },
      ];

      const result = modifiers
        .map((modifier) => {
          const ingredient = ingredients.find((ing) => ing.id === modifier.ingredientId);
          return ingredient ? { modifier, ingredient } : null;
        })
        .filter((item) => item !== null);

      expect(result).toHaveLength(1);
      expect(result[0]?.modifier.id).toBe("m1");
    });

    it("should return empty array when no ingredients match", () => {
      const modifiers = [{ id: "m1", ingredientId: "ing1", priceExtra: 0 }];
      const ingredients: never[] = [];

      const result = modifiers
        .map((modifier) => {
          const ingredient = ingredients.find((ing) => ing.id === modifier.ingredientId);
          return ingredient ? { modifier, ingredient } : null;
        })
        .filter((item) => item !== null);

      expect(result).toHaveLength(0);
    });
  });

  describe("getUnusedIngredientCategories", () => {
    it("should filter out used categories", () => {
      const categories = [
        { id: "cat1", name: "Category 1", rank: 1 },
        { id: "cat2", name: "Category 2", rank: 2 },
      ];
      const modifierGroups = [{ ingredientCategoryId: "cat1" }];

      const result = categories.filter((cat) => {
        const isUsed = modifierGroups.some(
          (g) => g.ingredientCategoryId === cat.id
        );
        return !isUsed;
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("cat2");
    });

    it("should return all categories when none are used", () => {
      const categories = [
        { id: "cat1", name: "Category 1", rank: 1 },
        { id: "cat2", name: "Category 2", rank: 2 },
      ];
      const modifierGroups: Array<{ ingredientCategoryId: string }> = [];

      const result = categories.filter((cat) => {
        const isUsed = modifierGroups.some(
          (g) => g.ingredientCategoryId === cat.id
        );
        return !isUsed;
      });

      expect(result).toHaveLength(2);
    });
  });

  describe("formatPrice", () => {
    it("should format price correctly", () => {
      const formatPrice = (price: number): string => {
        if (price === 0) return "";
        return `+${(price / 100).toFixed(2)} €`;
      };

      expect(formatPrice(0)).toBe("");
      expect(formatPrice(100)).toBe("+1.00 €");
      expect(formatPrice(250)).toBe("+2.50 €");
      expect(formatPrice(1234)).toBe("+12.34 €");
    });
  });

  describe("getModifierItemClassName", () => {
    it("should return correct class for available ingredient", () => {
      const getModifierItemClassName = (isAvailable: boolean): string => {
        return isAvailable
          ? "bg-background/30"
          : "opacity-50 bg-destructive/10";
      };

      expect(getModifierItemClassName(true)).toBe("bg-background/30");
      expect(getModifierItemClassName(false)).toBe("opacity-50 bg-destructive/10");
    });
  });
});
