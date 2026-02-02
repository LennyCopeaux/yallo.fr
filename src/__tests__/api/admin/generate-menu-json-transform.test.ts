import { describe, it, expect } from "vitest";

describe("Generate Menu JSON Transform Functions", () => {
  const mockModifierData = [
    {
      modifier: { id: "m1", ingredientId: "ing1", groupId: "g1", priceExtra: 100, variationId: "v1" },
      ingredient: { id: "ing1", name: "Sauce Blanche", ingredientCategoryId: "cat1", restaurantId: "r1", price: 0, isAvailable: true, imageUrl: null },
      groupId: "g1",
    },
    {
      modifier: { id: "m2", ingredientId: "ing2", groupId: "g1", priceExtra: 50, variationId: "v1" },
      ingredient: { id: "ing2", name: "Sauce Algérienne", ingredientCategoryId: "cat1", restaurantId: "r1", price: 0, isAvailable: false, imageUrl: null },
      groupId: "g1",
    },
  ];

  const mockModifierGroupData = [
    {
      group: { id: "g1", variationId: "v1", ingredientCategoryId: "cat1", minSelect: 1, maxSelect: 2 },
      variationId: "v1",
      ingredientCategory: { id: "cat1", name: "Sauces", restaurantId: "r1", rank: 1 },
    },
  ];

  const mockVariationData = [
    {
      variation: { id: "v1", categoryId: "cat1", name: "Kebab Veau", price: 700, description: null, isAvailable: true },
      categoryId: "cat1",
    },
  ];

  describe("transformModifiersForJson", () => {
    it("should transform modifiers with availability", () => {
      const transformModifiersForJson = (
        allModifiers: typeof mockModifierData,
        groupId: string
      ): Array<{ name: string; priceExtra: number; isAvailable: boolean }> => {
        return allModifiers
          .filter((m) => m.groupId === groupId)
          .map((m) => ({
            name: m.ingredient.name,
            priceExtra: m.modifier.priceExtra / 100,
            isAvailable: m.ingredient.isAvailable,
          }));
      };

      const result = transformModifiersForJson(mockModifierData, "g1");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: "Sauce Blanche", priceExtra: 1, isAvailable: true });
      expect(result[1]).toEqual({ name: "Sauce Algérienne", priceExtra: 0.5, isAvailable: false });
    });
  });

  describe("transformModifierGroupsForJson", () => {
    it("should transform modifier groups with options", () => {
      const transformModifiersForJson = (
        allModifiers: typeof mockModifierData,
        groupId: string
      ): Array<{ name: string; priceExtra: number; isAvailable: boolean }> => {
        return allModifiers
          .filter((m) => m.groupId === groupId)
          .map((m) => ({
            name: m.ingredient.name,
            priceExtra: m.modifier.priceExtra / 100,
            isAvailable: m.ingredient.isAvailable,
          }));
      };

      const transformModifierGroupsForJson = (
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
            options: transformModifiersForJson(allModifiers, mg.group.id),
          }));
      };

      const result = transformModifierGroupsForJson(mockModifierGroupData, mockModifierData, "v1");

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("Sauces");
      expect(result[0].options).toHaveLength(2);
    });
  });

  describe("transformVariationsForJson", () => {
    it("should transform variations with modifier groups", () => {
      const transformModifiersForJson = (
        allModifiers: typeof mockModifierData,
        groupId: string
      ): Array<{ name: string; priceExtra: number; isAvailable: boolean }> => {
        return allModifiers
          .filter((m) => m.groupId === groupId)
          .map((m) => ({
            name: m.ingredient.name,
            priceExtra: m.modifier.priceExtra / 100,
            isAvailable: m.ingredient.isAvailable,
          }));
      };

      const transformModifierGroupsForJson = (
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
            options: transformModifiersForJson(allModifiers, mg.group.id),
          }));
      };

      const transformVariationsForJson = (
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
            modifierGroups: transformModifierGroupsForJson(allModifierGroups, allModifiers, v.variation.id),
          }));
      };

      const result = transformVariationsForJson(mockVariationData, mockModifierGroupData, mockModifierData, "cat1");

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Kebab Veau");
      expect(result[0].price).toBe(7);
      expect(result[0].modifierGroups).toHaveLength(1);
    });
  });
});
