import { describe, it, expect } from "vitest";

describe("System Prompt Transform Functions", () => {
  const mockModifierData = [
    {
      modifier: { id: "m1", ingredientId: "ing1", groupId: "g1", priceExtra: 100, variationId: "v1" },
      ingredient: { id: "ing1", name: "Sauce Blanche", ingredientCategoryId: "cat1", restaurantId: "r1", price: 0, isAvailable: true, imageUrl: null },
      groupId: "g1",
    },
    {
      modifier: { id: "m2", ingredientId: "ing2", groupId: "g1", priceExtra: 50, variationId: "v1" },
      ingredient: { id: "ing2", name: "Sauce Algérienne", ingredientCategoryId: "cat1", restaurantId: "r1", price: 0, isAvailable: true, imageUrl: null },
      groupId: "g1",
    },
    {
      modifier: { id: "m3", ingredientId: "ing3", groupId: "g2", priceExtra: 0, variationId: "v1" },
      ingredient: { id: "ing3", name: "Salade", ingredientCategoryId: "cat2", restaurantId: "r1", price: 0, isAvailable: true, imageUrl: null },
      groupId: "g2",
    },
  ];

  const mockModifierGroupData = [
    {
      group: { id: "g1", variationId: "v1", ingredientCategoryId: "cat1", minSelect: 1, maxSelect: 2 },
      variationId: "v1",
      ingredientCategory: { id: "cat1", name: "Sauces", restaurantId: "r1", rank: 1 },
    },
    {
      group: { id: "g2", variationId: "v1", ingredientCategoryId: "cat2", minSelect: 0, maxSelect: 3 },
      variationId: "v1",
      ingredientCategory: { id: "cat2", name: "Crudités", restaurantId: "r1", rank: 2 },
    },
  ];

  const mockVariationData = [
    {
      variation: { id: "v1", categoryId: "cat1", name: "Kebab Veau", price: 700, description: null, isAvailable: true },
      categoryId: "cat1",
    },
  ];

  describe("transformModifiers", () => {
    it("should transform modifiers for a specific group", () => {
      const transformModifiers = (
        allModifiers: typeof mockModifierData,
        groupId: string
      ): Array<{ name: string; priceExtra: number }> => {
        return allModifiers
          .filter((m) => m.groupId === groupId)
          .map((m) => ({
            name: m.ingredient.name,
            priceExtra: m.modifier.priceExtra / 100,
          }));
      };

      const result = transformModifiers(mockModifierData, "g1");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: "Sauce Blanche", priceExtra: 1 });
      expect(result[1]).toEqual({ name: "Sauce Algérienne", priceExtra: 0.5 });
    });

    it("should return empty array for non-existent group", () => {
      const transformModifiers = (
        allModifiers: typeof mockModifierData,
        groupId: string
      ): Array<{ name: string; priceExtra: number }> => {
        return allModifiers
          .filter((m) => m.groupId === groupId)
          .map((m) => ({
            name: m.ingredient.name,
            priceExtra: m.modifier.priceExtra / 100,
          }));
      };

      const result = transformModifiers(mockModifierData, "non-existent");

      expect(result).toHaveLength(0);
    });
  });

  describe("transformModifierGroups", () => {
    it("should transform modifier groups for a variation", () => {
      const transformModifiers = (
        allModifiers: typeof mockModifierData,
        groupId: string
      ): Array<{ name: string; priceExtra: number }> => {
        return allModifiers
          .filter((m) => m.groupId === groupId)
          .map((m) => ({
            name: m.ingredient.name,
            priceExtra: m.modifier.priceExtra / 100,
          }));
      };

      const transformModifierGroups = (
        allModifierGroups: typeof mockModifierGroupData,
        allModifiers: typeof mockModifierData,
        variationId: string
      ) => {
        return allModifierGroups
          .filter((mg) => mg.variationId === variationId)
          .map((mg) => ({
            category: mg.ingredientCategory.name,
            minSelect: mg.group.minSelect,
            maxSelect: mg.group.maxSelect,
            options: transformModifiers(allModifiers, mg.group.id),
          }));
      };

      const result = transformModifierGroups(mockModifierGroupData, mockModifierData, "v1");

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe("Sauces");
      expect(result[0].minSelect).toBe(1);
      expect(result[0].maxSelect).toBe(2);
      expect(result[0].options).toHaveLength(2);
    });
  });

  describe("transformVariations", () => {
    it("should transform variations for a category", () => {
      const transformModifiers = (
        allModifiers: typeof mockModifierData,
        groupId: string
      ): Array<{ name: string; priceExtra: number }> => {
        return allModifiers
          .filter((m) => m.groupId === groupId)
          .map((m) => ({
            name: m.ingredient.name,
            priceExtra: m.modifier.priceExtra / 100,
          }));
      };

      const transformModifierGroups = (
        allModifierGroups: typeof mockModifierGroupData,
        allModifiers: typeof mockModifierData,
        variationId: string
      ) => {
        return allModifierGroups
          .filter((mg) => mg.variationId === variationId)
          .map((mg) => ({
            category: mg.ingredientCategory.name,
            minSelect: mg.group.minSelect,
            maxSelect: mg.group.maxSelect,
            options: transformModifiers(allModifiers, mg.group.id),
          }));
      };

      const transformVariations = (
        allVariations: typeof mockVariationData,
        allModifierGroups: typeof mockModifierGroupData,
        allModifiers: typeof mockModifierData,
        categoryId: string
      ) => {
        return allVariations
          .filter((v) => v.categoryId === categoryId)
          .map((v) => ({
            name: v.variation.name,
            price: v.variation.price / 100,
            modifierGroups: transformModifierGroups(allModifierGroups, allModifiers, v.variation.id),
          }));
      };

      const result = transformVariations(mockVariationData, mockModifierGroupData, mockModifierData, "cat1");

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Kebab Veau");
      expect(result[0].price).toBe(7);
      expect(result[0].modifierGroups).toHaveLength(2);
    });
  });
});
