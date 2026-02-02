import { describe, it, expect } from "vitest";

describe("Item Editor Helper Functions", () => {
  const mockIngredients = [
    { id: "ing1", name: "Sauce Blanche", ingredientCategoryId: "cat1", price: 0, isAvailable: true },
    { id: "ing2", name: "Sauce Algérienne", ingredientCategoryId: "cat1", price: 0, isAvailable: true },
    { id: "ing3", name: "Salade", ingredientCategoryId: "cat2", price: 0, isAvailable: true },
  ];

  describe("findIngredientId", () => {
    const findIngredientId = (
      ingredients: typeof mockIngredients,
      optName: string,
      categoryId: string
    ): string => {
      const ingredient = ingredients.find(
        ing => ing.name === optName && ing.ingredientCategoryId === categoryId
      );
      return ingredient?.id || "";
    };

    it("should find ingredient by name and category", () => {
      const result = findIngredientId(mockIngredients, "Sauce Blanche", "cat1");
      expect(result).toBe("ing1");
    });

    it("should return empty string when ingredient not found", () => {
      const result = findIngredientId(mockIngredients, "Unknown", "cat1");
      expect(result).toBe("");
    });

    it("should return empty string when category doesn't match", () => {
      const result = findIngredientId(mockIngredients, "Sauce Blanche", "cat2");
      expect(result).toBe("");
    });
  });

  describe("extractIngredientIds", () => {
    const extractIngredientIds = (
      ingredients: typeof mockIngredients,
      group: { options: Array<{ name: string }>; ingredientCategoryId: string }
    ): string[] => {
      return group.options
        .map(opt => {
          const ingredient = ingredients.find(
            ing => ing.name === opt.name && ing.ingredientCategoryId === group.ingredientCategoryId
          );
          return ingredient?.id || "";
        })
        .filter(Boolean);
    };

    it("should extract ingredient IDs from group options", () => {
      const group = {
        options: [
          { name: "Sauce Blanche" },
          { name: "Sauce Algérienne" },
        ],
        ingredientCategoryId: "cat1",
      };

      const result = extractIngredientIds(mockIngredients, group);
      expect(result).toEqual(["ing1", "ing2"]);
    });

    it("should filter out non-existent ingredients", () => {
      const group = {
        options: [
          { name: "Sauce Blanche" },
          { name: "Unknown Sauce" },
        ],
        ingredientCategoryId: "cat1",
      };

      const result = extractIngredientIds(mockIngredients, group);
      expect(result).toEqual(["ing1"]);
    });

    it("should return empty array when no options match", () => {
      const group = {
        options: [{ name: "Unknown" }],
        ingredientCategoryId: "cat1",
      };

      const result = extractIngredientIds(mockIngredients, group);
      expect(result).toEqual([]);
    });
  });

  describe("buildIngredientsByCategory", () => {
    const buildIngredientsByCategory = (
      ingredients: typeof mockIngredients,
      item: { optionGroups: Array<{ options: Array<{ name: string }>; ingredientCategoryId: string }> }
    ): Record<string, string[]> => {
      const ingredientsByCategory: Record<string, string[]> = {};
      item.optionGroups.forEach(group => {
        const ingredientIds = group.options
          .map(opt => {
            const ingredient = ingredients.find(
              ing => ing.name === opt.name && ing.ingredientCategoryId === group.ingredientCategoryId
            );
            return ingredient?.id || "";
          })
          .filter(Boolean);
        if (ingredientIds.length > 0) {
          ingredientsByCategory[group.ingredientCategoryId] = ingredientIds;
        }
      });
      return ingredientsByCategory;
    };

    it("should build ingredients grouped by category", () => {
      const item = {
        optionGroups: [
          {
            options: [{ name: "Sauce Blanche" }, { name: "Sauce Algérienne" }],
            ingredientCategoryId: "cat1",
          },
          {
            options: [{ name: "Salade" }],
            ingredientCategoryId: "cat2",
          },
        ],
      };

      const result = buildIngredientsByCategory(mockIngredients, item);
      expect(result).toEqual({
        cat1: ["ing1", "ing2"],
        cat2: ["ing3"],
      });
    });

    it("should skip categories with no matching ingredients", () => {
      const item = {
        optionGroups: [
          {
            options: [{ name: "Unknown" }],
            ingredientCategoryId: "cat1",
          },
        ],
      };

      const result = buildIngredientsByCategory(mockIngredients, item);
      expect(result).toEqual({});
    });
  });
});
