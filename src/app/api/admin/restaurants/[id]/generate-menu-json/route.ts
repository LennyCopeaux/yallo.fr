import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { restaurants, categories, productVariations, modifierGroups, modifiers, ingredients, ingredientCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { fetchHubriseCatalog, HubriseError } from "@/lib/services/hubrise";
import { logger } from "@/lib/logger";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }
  return session;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const [restaurant] = await db
      .select({
        id: restaurants.id,
        hubriseLocationId: restaurants.hubriseLocationId,
        hubriseAccessToken: restaurants.hubriseAccessToken,
      })
      .from(restaurants)
      .where(eq(restaurants.id, id))
      .limit(1);

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant non trouvé" }, { status: 404 });
    }

    if (restaurant.hubriseAccessToken && restaurant.hubriseLocationId) {
      try {
        const menuJson = await fetchHubriseCatalog(
          restaurant.hubriseAccessToken,
          restaurant.hubriseLocationId
        );
        return NextResponse.json({ menuJson });
      } catch (error) {
        const errorMessage = error instanceof HubriseError 
          ? error.message 
          : error instanceof Error 
          ? error.message 
          : "Erreur inconnue";
        logger.warn("HubRise indisponible, fallback sur menu Yallo", {
          restaurantId: id,
          error: errorMessage,
        });
      }
    }
    const allCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.restaurantId, id))
      .orderBy(asc(categories.rank));

    const allVariations = await db
      .select({
        variation: productVariations,
        categoryId: categories.id,
      })
      .from(productVariations)
      .innerJoin(categories, eq(productVariations.categoryId, categories.id))
      .where(eq(categories.restaurantId, id));

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
      .where(eq(categories.restaurantId, id));

    const allModifiers = await db
      .select({
        modifier: modifiers,
        ingredient: ingredients,
        groupId: modifierGroups.id,
      })
      .from(modifiers)
      .innerJoin(ingredients, eq(modifiers.ingredientId, ingredients.id))
      .innerJoin(modifierGroups, eq(modifiers.groupId, modifierGroups.id))
      .where(eq(ingredients.restaurantId, id));

    function transformModifiers(groupId: string) {
      return allModifiers
        .filter((m) => m.groupId === groupId)
        .map((m) => ({
          name: m.ingredient.name,
          priceExtra: m.modifier.priceExtra / 100,
          isAvailable: m.ingredient.isAvailable,
        }));
    }

    function transformModifierGroups(variationId: string) {
      return allModifierGroups
        .filter((mg) => mg.variationId === variationId)
        .map((mg) => ({
          category: mg.ingredientCategory.name,
          minSelect: mg.group.minSelect,
          maxSelect: mg.group.maxSelect,
          options: transformModifiers(mg.group.id),
        }));
    }

    function transformVariations(categoryId: string) {
      return allVariations
        .filter((v) => v.categoryId === categoryId)
        .map((v) => ({
          name: v.variation.name,
          price: v.variation.price / 100,
          modifierGroups: transformModifierGroups(v.variation.id),
        }));
    }

    const menuJson = allCategories.map((category) => ({
      category: category.name,
      items: transformVariations(category.id),
    }));

    return NextResponse.json({ menuJson: JSON.stringify(menuJson, null, 2) });
  } catch (error) {
    logger.error("Erreur génération JSON menu", error instanceof Error ? error : new Error(String(error)), {
      action: "generate-menu-json",
    });
    return NextResponse.json(
      { error: "Erreur lors de la génération du JSON" },
      { status: 500 }
    );
  }
}

