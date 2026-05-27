"use server";

import { db } from "@/db";
import { restaurants, MenuData } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { parseMenuFromBase64Images } from "@/lib/services/menu-parser";
import { requireAuth, getAccessibleRestaurant } from "@/lib/auth";
import { updateVapiAssistant } from "@/lib/services/vapi-agent";

async function getRestaurantForOwner() {
  const user = await requireAuth();
  if (user.role === "EMPLOYEE") throw new Error("Accès non autorisé");

  const restaurant = await getAccessibleRestaurant();
  if (!restaurant) throw new Error("Restaurant non trouvé");

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

    if (restaurant.vapiAssistantId) {
      try {
        await updateVapiAssistant(restaurant.vapiAssistantId, {
          ...restaurant,
          menuData,
        });
      } catch (err) {
        console.error("Erreur sync assistant VAPI après mise à jour menu :", err);
      }
    }

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

    if (restaurant.vapiAssistantId) {
      try {
        await updateVapiAssistant(restaurant.vapiAssistantId, {
          ...restaurant,
          menuData: null,
        });
      } catch (err) {
        console.error("Erreur sync assistant VAPI après suppression menu :", err);
      }
    }

    revalidatePath("/dashboard/menu");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}
