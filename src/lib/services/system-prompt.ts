import { db } from "@/db";
import { restaurants, categories, productVariations, modifierGroups, modifiers, ingredients, ingredientCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { fetchHubriseCatalog, HubriseError } from "./hubrise";
import { logger } from "@/lib/logger";

type Restaurant = typeof restaurants.$inferSelect;

type ModifierData = {
  modifier: typeof modifiers.$inferSelect;
  ingredient: typeof ingredients.$inferSelect;
  groupId: string;
};

type ModifierGroupData = {
  group: typeof modifierGroups.$inferSelect;
  variationId: string;
  ingredientCategory: typeof ingredientCategories.$inferSelect;
};

type VariationData = {
  variation: typeof productVariations.$inferSelect;
  categoryId: string;
};

function transformModifiers(
  allModifiers: ModifierData[],
  groupId: string
): Array<{ name: string; priceExtra: number }> {
  return allModifiers
    .filter((m) => m.groupId === groupId)
    .map((m) => ({
      name: m.ingredient.name,
      priceExtra: m.modifier.priceExtra / 100,
    }));
}

function transformModifierGroups(
  allModifierGroups: ModifierGroupData[],
  allModifiers: ModifierData[],
  variationId: string
): Array<{
  category: string;
  minSelect: number;
  maxSelect: number;
  options: Array<{ name: string; priceExtra: number }>;
}> {
  return allModifierGroups
    .filter((mg) => mg.variationId === variationId)
    .map((mg) => ({
      category: mg.ingredientCategory.name,
      minSelect: mg.group.minSelect,
      maxSelect: mg.group.maxSelect,
      options: transformModifiers(allModifiers, mg.group.id),
    }));
}

function transformVariations(
  allVariations: VariationData[],
  allModifierGroups: ModifierGroupData[],
  allModifiers: ModifierData[],
  categoryId: string
): Array<{
  name: string;
  price: number;
  modifierGroups: Array<{
    category: string;
    minSelect: number;
    maxSelect: number;
    options: Array<{ name: string; priceExtra: number }>;
  }>;
}> {
  return allVariations
    .filter((v) => v.categoryId === categoryId)
    .map((v) => ({
      name: v.variation.name,
      price: v.variation.price / 100,
      modifierGroups: transformModifierGroups(allModifierGroups, allModifiers, v.variation.id),
    }));
}

async function getMenuStructure(restaurantId: string, hubriseAccessToken: string | null, hubriseLocationId: string | null): Promise<unknown> {
  if (hubriseAccessToken && hubriseLocationId) {
    try {
      const menuJson = await fetchHubriseCatalog(hubriseAccessToken, hubriseLocationId);
      return JSON.parse(menuJson);
    } catch (error) {
      let errorMessage: string;
      if (error instanceof HubriseError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = "Erreur inconnue";
      }
      logger.warn("HubRise indisponible, fallback sur menu Yallo", {
        restaurantId,
        error: errorMessage,
      });
    }
  }

  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.restaurantId, restaurantId))
    .orderBy(asc(categories.rank));

  const allVariations = await db
    .select({
      variation: productVariations,
      categoryId: categories.id,
    })
    .from(productVariations)
    .innerJoin(categories, eq(productVariations.categoryId, categories.id))
    .where(eq(categories.restaurantId, restaurantId));

  const allModifierGroups = await db
    .select({
      group: modifierGroups,
      variationId: productVariations.id,
      ingredientCategory: ingredientCategories,
    })
    .from(modifierGroups)
    .innerJoin(productVariations, eq(modifierGroups.variationId, productVariations.id))
    .innerJoin(categories, eq(productVariations.categoryId, categories.id))
    .innerJoin(ingredientCategories, eq(modifierGroups.ingredientCategoryId, ingredientCategories.id))
    .where(eq(categories.restaurantId, restaurantId));

  const allModifiers = await db
    .select({
      modifier: modifiers,
      ingredient: ingredients,
      groupId: modifierGroups.id,
    })
    .from(modifiers)
    .innerJoin(ingredients, eq(modifiers.ingredientId, ingredients.id))
    .innerJoin(modifierGroups, eq(modifiers.groupId, modifierGroups.id))
    .where(eq(ingredients.restaurantId, restaurantId));

  return allCategories.map((category) => ({
    category: category.name,
    items: transformVariations(allVariations, allModifierGroups, allModifiers, category.id),
  }));
}

export async function generateSystemPrompt(restaurant: Restaurant): Promise<string> {
  const menuStructure = await getMenuStructure(
    restaurant.id,
    restaurant.hubriseAccessToken,
    restaurant.hubriseLocationId
  );

  return `Tu es l'assistant téléphonique de ${restaurant.name}.

Ton rôle est de :
- Prendre les commandes des clients de manière professionnelle et efficace
- Répondre aux questions sur le menu et les prix
- Proposer des suggestions appropriées basées sur les préférences du client
- Confirmer les commandes et les horaires de retrait
- Collecter le nom du client avant de terminer l'appel

Règles importantes :
- Reste professionnel et amical, mais concis (pas de familiarité excessive)
- Si tu ne comprends pas, demande poliment de répéter
- Ne valide JAMAIS un produit sans ses options obligatoires (ex: un kebab sans sauce)
- Demande TOUJOURS le nom du client avant de terminer l'appel
- Ne répète pas la commande complète jusqu'à la fin de l'appel (sauf confirmation finale)

Menu disponible :
${JSON.stringify(menuStructure, null, 2)}

Horaires d'ouverture :
${restaurant.businessHours || "Non configuré"}

En cas d'échec ou de demande du client, transfère l'appel vers le numéro : ${restaurant.phoneNumber}`;
}
