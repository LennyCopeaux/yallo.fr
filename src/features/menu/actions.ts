"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { categories, restaurants } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
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

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

const createCategorySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  restaurantId: z.string().uuid(),
});

const updateCategoryOrderSchema = z.object({
  categoryId: z.string().uuid(),
  rank: z.number().int().min(0),
});

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const rawData = {
    name: formData.get("name") as string,
    restaurantId: formData.get("restaurantId") as string,
  };

  const validation = createCategorySchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  const { name, restaurantId } = validation.data;

  const ownershipCheck = await verifyRestaurantOwnership(restaurantId);
  if (!ownershipCheck.success) {
    return { success: false, error: ownershipCheck.error };
  }

  try {
    const [maxRank] = await db
      .select({ maxRank: categories.rank })
      .from(categories)
      .where(eq(categories.restaurantId, restaurantId))
      .orderBy(asc(categories.rank))
      .limit(1);

    const newRank = maxRank ? maxRank.maxRank + 1 : 0;

    const [newCategory] = await db
      .insert(categories)
      .values({
        restaurantId,
        name,
        rank: newRank,
      })
      .returning();

    revalidatePath("/dashboard/menu");
    return { success: true, data: newCategory };
  } catch {
    return { success: false, error: "Erreur lors de la création de la catégorie" };
  }
}

export async function updateCategoryOrder(
  categoryId: string,
  rank: number
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const validation = updateCategoryOrderSchema.safeParse({ categoryId, rank });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Erreur de validation" };
  }

  try {
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

    await db
      .update(categories)
      .set({ rank })
      .where(eq(categories.id, categoryId));

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}
