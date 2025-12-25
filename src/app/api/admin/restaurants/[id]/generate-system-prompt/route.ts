import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { restaurants, categories, productVariations, modifierGroups, modifiers, ingredients, ingredientCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

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

    // Récupère le restaurant
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id))
      .limit(1);

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant non trouvé" }, { status: 404 });
    }

    // Récupère le menu complet
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

    // Construit le prompt système basé sur le menu
    const menuStructure = allCategories.map((category) => {
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

    // Génère le prompt système
    const systemPrompt = `Tu es l'assistant téléphonique de ${restaurant.name}.

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

    return NextResponse.json({ systemPrompt });
  } catch (error) {
    console.error("Erreur génération prompt:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du prompt" },
      { status: 500 }
    );
  }
}

