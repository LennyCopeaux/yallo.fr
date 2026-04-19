"use server";

import { db } from "@/db";
import { restaurants, MenuData } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { parseMenuFromBase64Images } from "@/lib/services/menu-parser";
import { requireAuth } from "@/lib/auth";

async function getRestaurantForOwner() {
  const user = await requireAuth();

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.ownerId, user.id));

  if (!restaurant) {
    throw new Error("Restaurant non trouvé");
  }

  return restaurant;
}

export async function getMenuData(): Promise<MenuData | null> {
  const restaurant = await getRestaurantForOwner();
  return restaurant.menuData ?? null;
}

export async function saveMenuData(menuData: MenuData): Promise<{ success: boolean; error?: string }> {
  try {
    const restaurant = await getRestaurantForOwner();

    await db
      .update(restaurants)
      .set({ 
        menuData,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurant.id));

    revalidatePath("/dashboard/menu");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

export async function generateMenuFromImages(
  base64Images: string[]
): Promise<{ success: boolean; menuData?: MenuData; error?: string }> {
  try {
    if (base64Images.length === 0) {
      return { success: false, error: "Aucune image fournie" };
    }

    if (base64Images.length > 5) {
      return { success: false, error: "Maximum 5 images autorisées" };
    }

    const menuData = await parseMenuFromBase64Images(base64Images);

    return { success: true, menuData };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de l'analyse";
    return { success: false, error: message };
  }
}

export async function clearMenuData(): Promise<{ success: boolean; error?: string }> {
  try {
    const restaurant = await getRestaurantForOwner();

    await db
      .update(restaurants)
      .set({ 
        menuData: null,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurant.id));

    revalidatePath("/dashboard/menu");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}
