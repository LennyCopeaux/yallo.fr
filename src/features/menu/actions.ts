"use server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import {
  ingredients,
  ingredientCategories,
  categories,
  productVariations,
  modifierGroups,
  modifiers,
  restaurants,
} from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function verifyRestaurantOwnership(restaurantId: string): Promise<{
  success: boolean;
  error?: string;
  restaurantId?: string;
}> {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  if (session.user.role === "ADMIN") {
    return { success: true, restaurantId };
  }

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, restaurantId), eq(restaurants.ownerId, session.user.id)))
    .limit(1);

  if (!restaurant) {
    return { success: false, error: "Restaurant non trouvé ou accès non autorisé" };
  }

  return { success: true, restaurantId };
}

async function getUserRestaurant(): Promise<{
  success: boolean;
  error?: string;
  restaurantId?: string;
}> {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  if (session.user.role === "ADMIN") {
    return { success: false, error: "Un restaurant doit être spécifié pour les admins" };
  }

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.ownerId, session.user.id))
    .limit(1);

  if (!restaurant) {
    return { success: false, error: "Aucun restaurant trouvé pour cet utilisateur" };
  }

  return { success: true, restaurantId: restaurant.id };
}

export type ActionResult<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
};

const toggleIngredientAvailabilitySchema = z.object({
  ingredientId: z.string().uuid(),
  isAvailable: z.boolean(),
});

const updateIngredientPriceSchema = z.object({
  ingredientId: z.string().uuid(),
  price: z.number().int().min(0),
});

const updateModifierPriceSchema = z.object({
  modifierId: z.string().uuid(),
  priceExtra: z.number().int().min(0),
});

const updateVariationPriceSchema = z.object({
  variationId: z.string().uuid(),
  price: z.number().int().positive(),
});

export async function toggleIngredientAvailability(
  ingredientId: string,
  isAvailable: boolean
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const validation = toggleIngredientAvailabilitySchema.safeParse({
    ingredientId,
    isAvailable,
  });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    const [targetIngredient] = await db
      .select({ restaurantId: ingredients.restaurantId })
      .from(ingredients)
      .where(eq(ingredients.id, ingredientId))
      .limit(1);

    if (!targetIngredient) return { success: false, error: "Ingrédient non trouvé" };

    const ownershipCheck = await verifyRestaurantOwnership(targetIngredient.restaurantId);
    if (!ownershipCheck.success) return { success: false, error: ownershipCheck.error };

    await db.update(ingredients).set({ isAvailable }).where(eq(ingredients.id, ingredientId));

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function updateIngredientPrice(
  ingredientId: string,
  price: number
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const validation = updateIngredientPriceSchema.safeParse({ ingredientId, price });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    const [targetIngredient] = await db
      .select({ restaurantId: ingredients.restaurantId })
      .from(ingredients)
      .where(eq(ingredients.id, ingredientId))
      .limit(1);

    if (!targetIngredient) return { success: false, error: "Ingrédient non trouvé" };

    const ownershipCheck = await verifyRestaurantOwnership(targetIngredient.restaurantId);
    if (!ownershipCheck.success) return { success: false, error: ownershipCheck.error };

    await db.update(ingredients).set({ price }).where(eq(ingredients.id, ingredientId));

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function updateVariationPrice(
  variationId: string,
  price: number
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const validation = updateVariationPriceSchema.safeParse({ variationId, price });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    const [targetVariation] = await db
      .select({ variationId: productVariations.id, restaurantId: restaurants.id })
      .from(productVariations)
      .innerJoin(categories, eq(productVariations.categoryId, categories.id))
      .innerJoin(restaurants, eq(categories.restaurantId, restaurants.id))
      .where(eq(productVariations.id, variationId))
      .limit(1);

    if (!targetVariation) return { success: false, error: "Variation non trouvée" };

    const ownershipCheck = await verifyRestaurantOwnership(targetVariation.restaurantId);
    if (!ownershipCheck.success) return { success: false, error: ownershipCheck.error };

    await db.update(productVariations).set({ price }).where(eq(productVariations.id, variationId));

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function updateModifierPrice(
  modifierId: string,
  priceExtra: number
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const validation = updateModifierPriceSchema.safeParse({ modifierId, priceExtra });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    const [targetModifier] = await db
      .select({ modifierId: modifiers.id, restaurantId: restaurants.id })
      .from(modifiers)
      .innerJoin(modifierGroups, eq(modifiers.groupId, modifierGroups.id))
      .innerJoin(productVariations, eq(modifierGroups.variationId, productVariations.id))
      .innerJoin(categories, eq(productVariations.categoryId, categories.id))
      .innerJoin(restaurants, eq(categories.restaurantId, restaurants.id))
      .where(eq(modifiers.id, modifierId))
      .limit(1);

    if (!targetModifier) return { success: false, error: "Modificateur non trouvé" };

    const ownershipCheck = await verifyRestaurantOwnership(targetModifier.restaurantId);
    if (!ownershipCheck.success) return { success: false, error: ownershipCheck.error };

    await db.update(modifiers).set({ priceExtra }).where(eq(modifiers.id, modifierId));

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

type ModifierWithIngredient = {
  modifier: typeof modifiers.$inferSelect;
  ingredient: typeof ingredients.$inferSelect;
  groupId: string;
};

type ModifierGroupWithCategory = {
  group: typeof modifierGroups.$inferSelect;
  variationId: string;
  ingredientCategory: typeof ingredientCategories.$inferSelect;
};

function buildModifiersForGroup(targetGroupId: string, modifiersList: ModifierWithIngredient[]) {
  return modifiersList
    .filter((mod) => mod.groupId === targetGroupId)
    .map((mod) => ({ ...mod.modifier, ingredient: mod.ingredient }));
}

function buildModifierGroupsForVariation(
  targetVariationId: string,
  groupsList: ModifierGroupWithCategory[],
  modifiersList: ModifierWithIngredient[]
) {
  return groupsList
    .filter((grp) => grp.variationId === targetVariationId)
    .map((grp) => ({
      ...grp.group,
      ingredientCategory: grp.ingredientCategory,
      modifiers: buildModifiersForGroup(grp.group.id, modifiersList),
    }));
}

export async function getMenuData() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const restaurantCheck = await getUserRestaurant();
  if (!restaurantCheck.success || !restaurantCheck.restaurantId) {
    return null;
  }

  const restaurantId = restaurantCheck.restaurantId;

  try {
    const menuCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.restaurantId, restaurantId))
      .orderBy(asc(categories.rank));

    const productsByCategory = await db
      .select({ variation: productVariations, categoryId: categories.id })
      .from(productVariations)
      .innerJoin(categories, eq(productVariations.categoryId, categories.id))
      .where(eq(categories.restaurantId, restaurantId));

    const optionGroups = await db
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

    const ingredientModifiers = await db
      .select({
        modifier: modifiers,
        ingredient: ingredients,
        group: modifierGroups,
        groupId: modifierGroups.id,
      })
      .from(modifiers)
      .innerJoin(ingredients, eq(modifiers.ingredientId, ingredients.id))
      .innerJoin(modifierGroups, eq(modifiers.groupId, modifierGroups.id))
      .where(eq(ingredients.restaurantId, restaurantId));

    const ingredientsList = await db
      .select({ ingredient: ingredients, ingredientCategory: ingredientCategories })
      .from(ingredients)
      .innerJoin(ingredientCategories, eq(ingredients.ingredientCategoryId, ingredientCategories.id))
      .where(eq(ingredients.restaurantId, restaurantId))
      .orderBy(asc(ingredientCategories.rank), asc(ingredients.name));

    const categoriesWithProducts = menuCategories.map((category) => ({
      ...category,
      variations: productsByCategory
        .filter((prod) => prod.categoryId === category.id)
        .map((prod) => ({
          ...prod.variation,
          modifierGroups: buildModifierGroupsForVariation(prod.variation.id, optionGroups, ingredientModifiers),
        })),
    }));

    const ingredientsWithCategory = ingredientsList.map((row) => ({
      ...row.ingredient,
      ingredientCategory: row.ingredientCategory,
    }));

    const ingredientCategoriesList = await db
      .select()
      .from(ingredientCategories)
      .where(eq(ingredientCategories.restaurantId, restaurantId))
      .orderBy(asc(ingredientCategories.rank));

    return {
      restaurantId,
      categories: categoriesWithProducts,
      ingredients: ingredientsWithCategory,
      ingredientCategories: ingredientCategoriesList,
    };
  } catch {
    return null;
  }
}

const createIngredientCategorySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
});

export async function createIngredientCategory(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const restaurantCheck = await getUserRestaurant();
  if (!restaurantCheck.success || !restaurantCheck.restaurantId) {
    return { success: false, error: restaurantCheck.error || "Restaurant non trouvé" };
  }

  const validation = createIngredientCategorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    const highestRank = await db
      .select({ rank: ingredientCategories.rank })
      .from(ingredientCategories)
      .where(eq(ingredientCategories.restaurantId, restaurantCheck.restaurantId))
      .orderBy(desc(ingredientCategories.rank))
      .limit(1);

    const [createdCategory] = await db
      .insert(ingredientCategories)
      .values({
        restaurantId: restaurantCheck.restaurantId,
        name: validation.data.name,
        rank: (highestRank[0]?.rank ?? -1) + 1,
      })
      .returning();

    revalidatePath("/dashboard/menu");
    return { success: true, data: createdCategory };
  } catch {
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function updateIngredientCategory(
  categoryId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorisé" };

  const [targetCategory] = await db
    .select({ restaurantId: ingredientCategories.restaurantId })
    .from(ingredientCategories)
    .where(eq(ingredientCategories.id, categoryId))
    .limit(1);

  if (!targetCategory) return { success: false, error: "Catégorie non trouvée" };

  const ownershipCheck = await verifyRestaurantOwnership(targetCategory.restaurantId);
  if (!ownershipCheck.success) return { success: false, error: ownershipCheck.error };

  const validation = createIngredientCategorySchema.safeParse({ name: formData.get("name") });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    await db
      .update(ingredientCategories)
      .set({ name: validation.data.name })
      .where(eq(ingredientCategories.id, categoryId));

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteIngredientCategory(categoryId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorisé" };

  const [targetCategory] = await db
    .select({ restaurantId: ingredientCategories.restaurantId })
    .from(ingredientCategories)
    .where(eq(ingredientCategories.id, categoryId))
    .limit(1);

  if (!targetCategory) return { success: false, error: "Catégorie non trouvée" };

  const ownershipCheck = await verifyRestaurantOwnership(targetCategory.restaurantId);
  if (!ownershipCheck.success) return { success: false, error: ownershipCheck.error };

  try {
    const hasIngredients = await db
      .select()
      .from(ingredients)
      .where(eq(ingredients.ingredientCategoryId, categoryId))
      .limit(1);

    if (hasIngredients.length > 0) {
      return { success: false, error: "Cette catégorie contient des ingrédients. Supprimez-les d'abord." };
    }

    await db.delete(ingredientCategories).where(eq(ingredientCategories.id, categoryId));

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

const createIngredientSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  ingredientCategoryId: z.string().uuid(),
  price: z.number().int().min(0),
  isAvailable: z.boolean().default(true),
});

export async function createIngredient(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorisé" };

  const restaurantCheck = await getUserRestaurant();
  if (!restaurantCheck.success || !restaurantCheck.restaurantId) {
    return { success: false, error: restaurantCheck.error || "Restaurant non trouvé" };
  }

  const availabilityInput = formData.get("isAvailable");
  const isAvailable = availabilityInput === null || availabilityInput === undefined ? true : availabilityInput === "true";

  const priceInput = formData.get("price");
  const validation = createIngredientSchema.safeParse({
    name: formData.get("name"),
    ingredientCategoryId: formData.get("ingredientCategoryId"),
    price: priceInput ? Math.round(Number.parseFloat(priceInput as string) * 100) : 0,
    isAvailable,
  });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    const [targetCategory] = await db
      .select({ restaurantId: ingredientCategories.restaurantId })
      .from(ingredientCategories)
      .where(eq(ingredientCategories.id, validation.data.ingredientCategoryId))
      .limit(1);

    if (!targetCategory) return { success: false, error: "Catégorie d'ingrédient non trouvée" };
    if (targetCategory.restaurantId !== restaurantCheck.restaurantId) {
      return { success: false, error: "La catégorie n'appartient pas à votre restaurant" };
    }

    const [createdIngredient] = await db
      .insert(ingredients)
      .values({
        restaurantId: restaurantCheck.restaurantId,
        ingredientCategoryId: validation.data.ingredientCategoryId,
        name: validation.data.name,
        price: validation.data.price,
        isAvailable: validation.data.isAvailable,
      })
      .returning();

    revalidatePath("/dashboard/menu");
    return { success: true, data: createdIngredient };
  } catch {
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function updateIngredient(
  ingredientId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorisé" };

  const [targetIngredient] = await db
    .select({ restaurantId: ingredients.restaurantId })
    .from(ingredients)
    .where(eq(ingredients.id, ingredientId))
    .limit(1);

  if (!targetIngredient) return { success: false, error: "Ingrédient non trouvé" };

  const ownershipCheck = await verifyRestaurantOwnership(targetIngredient.restaurantId);
  if (!ownershipCheck.success) return { success: false, error: ownershipCheck.error };

  const priceInput = formData.get("price");
  const categoryInput = formData.get("ingredientCategoryId");
  const availabilityInput = formData.get("isAvailable");
  const isAvailable = availabilityInput === null || availabilityInput === undefined ? undefined : availabilityInput === "true";

  const validation = createIngredientSchema.partial().safeParse({
    name: formData.get("name"),
    ingredientCategoryId: categoryInput || undefined,
    price: priceInput ? Math.round(Number.parseFloat(priceInput as string) * 100) : undefined,
    isAvailable,
  });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    await db.update(ingredients).set(validation.data).where(eq(ingredients.id, ingredientId));
    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteIngredient(ingredientId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorisé" };

  const [targetIngredient] = await db
    .select({ restaurantId: ingredients.restaurantId })
    .from(ingredients)
    .where(eq(ingredients.id, ingredientId))
    .limit(1);

  if (!targetIngredient) return { success: false, error: "Ingrédient non trouvé" };

  const ownershipCheck = await verifyRestaurantOwnership(targetIngredient.restaurantId);
  if (!ownershipCheck.success) return { success: false, error: ownershipCheck.error };

  try {
    const isUsedInProducts = await db
      .select()
      .from(modifiers)
      .where(eq(modifiers.ingredientId, ingredientId))
      .limit(1);

    if (isUsedInProducts.length > 0) {
      return { success: false, error: "Cet ingrédient est utilisé dans des produits. Supprimez-le d'abord des produits." };
    }

    await db.delete(ingredients).where(eq(ingredients.id, ingredientId));
    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

const createCategorySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
});

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const restaurantCheck = await getUserRestaurant();
  if (!restaurantCheck.success || !restaurantCheck.restaurantId) {
    return { success: false, error: restaurantCheck.error || "Restaurant non trouvé" };
  }

  const validation = createCategorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    // Trouver le rank maximum
    const maxRankResult = await db
      .select({ rank: categories.rank })
      .from(categories)
      .where(eq(categories.restaurantId, restaurantCheck.restaurantId))
      .orderBy(desc(categories.rank))
      .limit(1);

    const [category] = await db
      .insert(categories)
      .values({
        restaurantId: restaurantCheck.restaurantId,
        name: validation.data.name,
        rank: (maxRankResult[0]?.rank ?? -1) + 1,
      })
      .returning();

    revalidatePath("/dashboard/menu");
    return { success: true, data: category };
  } catch (error) {
    console.error("Erreur création catégorie:", error);
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function updateCategory(
  categoryId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const [category] = await db
    .select({ restaurantId: categories.restaurantId })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!category) {
    return { success: false, error: "Catégorie non trouvée" };
  }

  const ownershipCheck = await verifyRestaurantOwnership(category.restaurantId);
  if (!ownershipCheck.success) {
    return { success: false, error: ownershipCheck.error };
  }

  const validation = createCategorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    await db
      .update(categories)
      .set({ name: validation.data.name })
      .where(eq(categories.id, categoryId));

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error) {
    console.error("Erreur mise à jour catégorie:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const [category] = await db
    .select({ restaurantId: categories.restaurantId })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!category) {
    return { success: false, error: "Catégorie non trouvée" };
  }

  const ownershipCheck = await verifyRestaurantOwnership(category.restaurantId);
  if (!ownershipCheck.success) {
    return { success: false, error: ownershipCheck.error };
  }

  try {
    // Vérifier si la catégorie contient des variations
    const variationCount = await db
      .select()
      .from(productVariations)
      .where(eq(productVariations.categoryId, categoryId))
      .limit(1);

    if (variationCount.length > 0) {
      return { success: false, error: "Cette catégorie contient des variations. Supprimez-les d'abord." };
    }

    await db.delete(categories).where(eq(categories.id, categoryId));

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression catégorie:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// ============================================
// CRUD PRODUCT VARIATIONS
// ============================================

const createVariationSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1, "Le nom est requis"),
  price: z.number().int().positive(),
});

export async function createVariation(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const validation = createVariationSchema.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    price: Math.round(Number.parseFloat(formData.get("price") as string) * 100),
  });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    // Vérifier que la catégorie appartient au restaurant
    const [category] = await db
      .select({ restaurantId: categories.restaurantId })
      .from(categories)
      .where(eq(categories.id, validation.data.categoryId))
      .limit(1);

    if (!category) {
      return { success: false, error: "Catégorie non trouvée" };
    }

    const ownershipCheck = await verifyRestaurantOwnership(category.restaurantId);
    if (!ownershipCheck.success) {
      return { success: false, error: ownershipCheck.error };
    }

    const [variation] = await db
      .insert(productVariations)
      .values({
        categoryId: validation.data.categoryId,
        name: validation.data.name,
        price: validation.data.price,
      })
      .returning();

    revalidatePath("/dashboard/menu");
    return { success: true, data: variation };
  } catch (error) {
    console.error("Erreur création variation:", error);
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function updateVariation(
  variationId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const [variation] = await db
    .select({
      variationId: productVariations.id,
      restaurantId: restaurants.id,
    })
    .from(productVariations)
    .innerJoin(categories, eq(productVariations.categoryId, categories.id))
    .innerJoin(restaurants, eq(categories.restaurantId, restaurants.id))
    .where(eq(productVariations.id, variationId))
    .limit(1);

  if (!variation) {
    return { success: false, error: "Variation non trouvée" };
  }

  const ownershipCheck = await verifyRestaurantOwnership(variation.restaurantId);
  if (!ownershipCheck.success) {
    return { success: false, error: ownershipCheck.error };
  }

  const priceValue = formData.get("price");
  const validation = createVariationSchema.partial().safeParse({
    name: formData.get("name"),
    price: priceValue ? Math.round(Number.parseFloat(priceValue as string) * 100) : undefined,
  });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    await db
      .update(productVariations)
      .set(validation.data)
      .where(eq(productVariations.id, variationId));

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error) {
    console.error("Erreur mise à jour variation:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function toggleVariationAvailability(
  variationId: string,
  isAvailable: boolean
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const [variation] = await db
    .select({
      variationId: productVariations.id,
      restaurantId: restaurants.id,
    })
    .from(productVariations)
    .innerJoin(categories, eq(productVariations.categoryId, categories.id))
    .innerJoin(restaurants, eq(categories.restaurantId, restaurants.id))
    .where(eq(productVariations.id, variationId))
    .limit(1);

  if (!variation) {
    return { success: false, error: "Variation non trouvée" };
  }

  const ownershipCheck = await verifyRestaurantOwnership(variation.restaurantId);
  if (!ownershipCheck.success) {
    return { success: false, error: ownershipCheck.error };
  }

  try {
    await db
      .update(productVariations)
      .set({ isAvailable })
      .where(eq(productVariations.id, variationId));

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error) {
    console.error("Erreur mise à jour disponibilité variation:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteVariation(variationId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const [variation] = await db
    .select({
      variationId: productVariations.id,
      restaurantId: restaurants.id,
    })
    .from(productVariations)
    .innerJoin(categories, eq(productVariations.categoryId, categories.id))
    .innerJoin(restaurants, eq(categories.restaurantId, restaurants.id))
    .where(eq(productVariations.id, variationId))
    .limit(1);

  if (!variation) {
    return { success: false, error: "Variation non trouvée" };
  }

  const ownershipCheck = await verifyRestaurantOwnership(variation.restaurantId);
  if (!ownershipCheck.success) {
    return { success: false, error: ownershipCheck.error };
  }

  try {
    await db.delete(productVariations).where(eq(productVariations.id, variationId));

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression variation:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// ============================================
// CRUD MODIFIER GROUPS
// ============================================

const createModifierGroupSchema = z.object({
  variationId: z.string().uuid(),
  ingredientCategoryId: z.string().uuid(),
  minSelect: z.number().int().min(0),
  maxSelect: z.number().int().min(1),
});

export async function createModifierGroup(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const validation = createModifierGroupSchema.safeParse({
    variationId: formData.get("variationId"),
    ingredientCategoryId: formData.get("ingredientCategoryId"),
    minSelect: Number.parseInt(formData.get("minSelect") as string),
    maxSelect: Number.parseInt(formData.get("maxSelect") as string),
  });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    // Vérifier que la variation appartient au restaurant
    const [variation] = await db
      .select({
        variationId: productVariations.id,
        restaurantId: restaurants.id,
      })
      .from(productVariations)
      .innerJoin(categories, eq(productVariations.categoryId, categories.id))
      .innerJoin(restaurants, eq(categories.restaurantId, restaurants.id))
      .where(eq(productVariations.id, validation.data.variationId))
      .limit(1);

    if (!variation) {
      return { success: false, error: "Variation non trouvée" };
    }

    const ownershipCheck = await verifyRestaurantOwnership(variation.restaurantId);
    if (!ownershipCheck.success) {
      return { success: false, error: ownershipCheck.error };
    }

    // Vérifier que la catégorie d'ingrédients appartient au restaurant
    const [ingredientCategory] = await db
      .select({ restaurantId: ingredientCategories.restaurantId })
      .from(ingredientCategories)
      .where(eq(ingredientCategories.id, validation.data.ingredientCategoryId))
      .limit(1);

    if (!ingredientCategory) {
      return { success: false, error: "Catégorie d'ingrédients non trouvée" };
    }

    const categoryOwnershipCheck = await verifyRestaurantOwnership(ingredientCategory.restaurantId);
    if (!categoryOwnershipCheck.success) {
      return { success: false, error: categoryOwnershipCheck.error };
    }

    // Vérifier que la catégorie d'ingrédients n'est pas déjà utilisée dans cette variation
    const existingGroup = await db
      .select()
      .from(modifierGroups)
      .where(
        and(
          eq(modifierGroups.variationId, validation.data.variationId),
          eq(modifierGroups.ingredientCategoryId, validation.data.ingredientCategoryId)
        )
      )
      .limit(1);

    if (existingGroup.length > 0) {
      return { success: false, error: "Cette catégorie d'ingrédients est déjà ajoutée à cette variation" };
    }

    const [group] = await db
      .insert(modifierGroups)
      .values({
        variationId: validation.data.variationId,
        ingredientCategoryId: validation.data.ingredientCategoryId,
        minSelect: validation.data.minSelect,
        maxSelect: validation.data.maxSelect,
      })
      .returning();

    // Ajouter automatiquement tous les ingrédients de cette catégorie au groupe
    const categoryIngredients = await db
      .select()
      .from(ingredients)
      .where(eq(ingredients.ingredientCategoryId, validation.data.ingredientCategoryId));

    if (categoryIngredients.length > 0) {
      await db.insert(modifiers).values(
        categoryIngredients.map((ing) => ({
          groupId: group.id,
          ingredientId: ing.id,
          priceExtra: ing.price, // Utilise le prix par défaut de l'ingrédient
        }))
      );
    }

    revalidatePath("/dashboard/menu");
    return { success: true, data: group };
  } catch (error) {
    console.error("Erreur création groupe modificateur:", error);
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function deleteModifierGroup(groupId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const [group] = await db
    .select({
      groupId: modifierGroups.id,
      restaurantId: restaurants.id,
    })
    .from(modifierGroups)
    .innerJoin(productVariations, eq(modifierGroups.variationId, productVariations.id))
    .innerJoin(categories, eq(productVariations.categoryId, categories.id))
    .innerJoin(restaurants, eq(categories.restaurantId, restaurants.id))
    .where(eq(modifierGroups.id, groupId))
    .limit(1);

  if (!group) {
    return { success: false, error: "Groupe non trouvé" };
  }

  const ownershipCheck = await verifyRestaurantOwnership(group.restaurantId);
  if (!ownershipCheck.success) {
    return { success: false, error: ownershipCheck.error };
  }

  try {
    await db.delete(modifierGroups).where(eq(modifierGroups.id, groupId));

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression groupe:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// ============================================
// CRUD MODIFIERS
// ============================================

const createModifierSchema = z.object({
  groupId: z.string().uuid(),
  ingredientId: z.string().uuid(),
  priceExtra: z.number().int().min(0),
});

export async function createModifier(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const validation = createModifierSchema.safeParse({
    groupId: formData.get("groupId"),
    ingredientId: formData.get("ingredientId"),
    priceExtra: Math.round(Number.parseFloat(formData.get("priceExtra") as string) * 100),
  });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    // Vérifier que le groupe appartient au restaurant
    const [group] = await db
      .select({
        groupId: modifierGroups.id,
        restaurantId: restaurants.id,
      })
      .from(modifierGroups)
      .innerJoin(productVariations, eq(modifierGroups.variationId, productVariations.id))
      .innerJoin(categories, eq(productVariations.categoryId, categories.id))
      .innerJoin(restaurants, eq(categories.restaurantId, restaurants.id))
      .where(eq(modifierGroups.id, validation.data.groupId))
      .limit(1);

    if (!group) {
      return { success: false, error: "Groupe non trouvé" };
    }

    // Vérifier que l'ingrédient appartient au même restaurant
    const [ingredient] = await db
      .select({ restaurantId: ingredients.restaurantId })
      .from(ingredients)
      .where(eq(ingredients.id, validation.data.ingredientId))
      .limit(1);

    if (!ingredient) {
      return { success: false, error: "Ingrédient non trouvé" };
    }

    const ownershipCheck = await verifyRestaurantOwnership(group.restaurantId);
    if (!ownershipCheck.success) {
      return { success: false, error: ownershipCheck.error };
    }

    if (ingredient.restaurantId !== group.restaurantId) {
      return { success: false, error: "L'ingrédient n'appartient pas au même restaurant" };
    }

    const [modifier] = await db
      .insert(modifiers)
      .values({
        groupId: validation.data.groupId,
        ingredientId: validation.data.ingredientId,
        priceExtra: validation.data.priceExtra,
      })
      .returning();

    revalidatePath("/dashboard/menu");
    return { success: true, data: modifier };
  } catch (error) {
    console.error("Erreur création modificateur:", error);
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function deleteModifier(modifierId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const [modifier] = await db
    .select({
      modifierId: modifiers.id,
      restaurantId: restaurants.id,
    })
    .from(modifiers)
    .innerJoin(modifierGroups, eq(modifiers.groupId, modifierGroups.id))
    .innerJoin(productVariations, eq(modifierGroups.variationId, productVariations.id))
    .innerJoin(categories, eq(productVariations.categoryId, categories.id))
    .innerJoin(restaurants, eq(categories.restaurantId, restaurants.id))
    .where(eq(modifiers.id, modifierId))
    .limit(1);

  if (!modifier) {
    return { success: false, error: "Modificateur non trouvé" };
  }

  const ownershipCheck = await verifyRestaurantOwnership(modifier.restaurantId);
  if (!ownershipCheck.success) {
    return { success: false, error: ownershipCheck.error };
  }

  try {
    await db.delete(modifiers).where(eq(modifiers.id, modifierId));

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression modificateur:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// Ajouter plusieurs ingrédients manquants à un groupe
const addMissingIngredientsSchema = z.object({
  groupId: z.string().uuid(),
  ingredientIds: z.array(z.string().uuid()),
});

export async function addMissingIngredientsToGroup(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const ingredientIdsJson = formData.get("ingredientIds");
  if (!ingredientIdsJson) {
    return { success: false, error: "Aucun ingrédient sélectionné" };
  }

  const ingredientIds = JSON.parse(ingredientIdsJson as string) as string[];

  const validation = addMissingIngredientsSchema.safeParse({
    groupId: formData.get("groupId"),
    ingredientIds,
  });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
    // Vérifier que le groupe appartient au restaurant
    const [group] = await db
      .select({
        groupId: modifierGroups.id,
        restaurantId: restaurants.id,
        ingredientCategoryId: modifierGroups.ingredientCategoryId,
      })
      .from(modifierGroups)
      .innerJoin(productVariations, eq(modifierGroups.variationId, productVariations.id))
      .innerJoin(categories, eq(productVariations.categoryId, categories.id))
      .innerJoin(restaurants, eq(categories.restaurantId, restaurants.id))
      .where(eq(modifierGroups.id, validation.data.groupId))
      .limit(1);

    if (!group) {
      return { success: false, error: "Groupe non trouvé" };
    }

    const ownershipCheck = await verifyRestaurantOwnership(group.restaurantId);
    if (!ownershipCheck.success) {
      return { success: false, error: ownershipCheck.error };
    }

    // Récupérer les ingrédients déjà dans le groupe
    const existingModifiers = await db
      .select({ ingredientId: modifiers.ingredientId })
      .from(modifiers)
      .where(eq(modifiers.groupId, validation.data.groupId));

    const existingIngredientIds = new Set(existingModifiers.map((m) => m.ingredientId));

    // Filtrer les ingrédients qui ne sont pas déjà dans le groupe
    const newIngredientIds = validation.data.ingredientIds.filter(
      (id) => !existingIngredientIds.has(id)
    );

    if (newIngredientIds.length === 0) {
      return { success: false, error: "Tous les ingrédients sont déjà dans le groupe" };
    }

    // Récupérer les ingrédients avec leurs prix
    const ingredientsToAdd = await db
      .select()
      .from(ingredients)
      .where(
        and(
          eq(ingredients.restaurantId, group.restaurantId),
          eq(ingredients.ingredientCategoryId, group.ingredientCategoryId)
        )
      )
      .then((ings) => ings.filter((ing) => newIngredientIds.includes(ing.id)));

    if (ingredientsToAdd.length === 0) {
      return { success: false, error: "Aucun ingrédient valide trouvé" };
    }

    // Ajouter les ingrédients au groupe avec leur prix par défaut
    await db.insert(modifiers).values(
      ingredientsToAdd.map((ing) => ({
        groupId: validation.data.groupId,
        ingredientId: ing.id,
        priceExtra: ing.price,
      }))
    );

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error) {
    console.error("Erreur ajout ingrédients:", error);
    return { success: false, error: "Erreur lors de l'ajout" };
  }
}

