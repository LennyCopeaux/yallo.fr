import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { restaurants, categories, productVariations, modifierGroups, modifiers, ingredients, ingredientCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { fetchHubriseCatalog, HubriseError } from "@/lib/services/hubrise";

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
        console.warn(
          `HubRise indisponible pour le restaurant ${id}, fallback sur menu Yallo. Erreur: ${error instanceof HubriseError ? error.message : error instanceof Error ? error.message : "Erreur inconnue"}`
        );
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

    const menuJson = allCategories.map((category) => {
      const categoryVariations = allVariations
        .filter((v) => v.categoryId === category.id)
        .map((v) => {
          const variationGroups = allModifierGroups
            .filter((mg) => mg.variationId === v.variation.id)
            .map((mg) => {
              const groupModifiers = allModifiers
                .filter((m) => m.groupId === mg.group.id)
                .map((m) => ({
                  name: m.ingredient.name,
                  priceExtra: m.modifier.priceExtra / 100,
                  isAvailable: m.ingredient.isAvailable,
                }));

              return {
                category: mg.ingredientCategory.name,
                minSelect: mg.group.minSelect,
                maxSelect: mg.group.maxSelect,
                options: groupModifiers,
              };
            });

          return {
            name: v.variation.name,
            price: v.variation.price / 100,
            modifierGroups: variationGroups,
          };
        });

      return {
        category: category.name,
        items: categoryVariations,
      };
    });

    return NextResponse.json({ menuJson: JSON.stringify(menuJson, null, 2) });
  } catch (error) {
    console.error("Erreur génération JSON menu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du JSON" },
      { status: 500 }
    );
  }
}

