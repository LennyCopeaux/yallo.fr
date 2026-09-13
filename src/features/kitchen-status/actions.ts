"use server";

import { db } from "@/db";
import { restaurants, type KitchenStatus } from "@/db/schema";
import { requireAuth, getAccessibleRestaurant } from "@/lib/auth";
import { requirePaidSubscription } from "@/lib/subscription-access";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DEFAULT_STATUS_SETTINGS } from "./constants";
import { updateVapiAssistant } from "@/lib/services/vapi-agent";

const statusSettingsSchema = z.object({
  CALM: z.union([
    z.object({ fixed: z.number().int().min(0) }),
    z.object({ min: z.number().int().min(0), max: z.number().int().min(0) }),
  ]).optional(),
  NORMAL: z.union([
    z.object({ fixed: z.number().int().min(0) }),
    z.object({ min: z.number().int().min(0), max: z.number().int().min(0) }),
  ]).optional(),
  RUSH: z.union([
    z.object({ fixed: z.number().int().min(0) }),
    z.object({ min: z.number().int().min(0), max: z.number().int().min(0) }),
  ]).optional(),
  STOP: z.object({ message: z.string().optional() }).optional(),
});

export type StatusSettings = z.infer<typeof statusSettingsSchema>;

export async function getKitchenStatus() {
  const ownerRestaurant = await getAccessibleRestaurant();
  if (!ownerRestaurant) return null;

  if (!ownerRestaurant.statusSettings) {
    await db
      .update(restaurants)
      .set({ statusSettings: DEFAULT_STATUS_SETTINGS, updatedAt: new Date() })
      .where(eq(restaurants.id, ownerRestaurant.id));

    return { ...ownerRestaurant, statusSettings: DEFAULT_STATUS_SETTINGS };
  }

  return ownerRestaurant;
}

export async function updateKitchenStatus(status: KitchenStatus) {
  await requireAuth();
  await requirePaidSubscription();

  const isValidStatus = ["CALM", "NORMAL", "RUSH", "STOP"].includes(status);
  if (!isValidStatus) throw new Error("Statut invalide");

  const ownerRestaurant = await getAccessibleRestaurant();
  if (!ownerRestaurant) throw new Error("Restaurant non trouvé");

  // Choix explicite du restaurateur : la bascule automatique ne doit plus
  // redescendre ce statut toute seule.
  await db
    .update(restaurants)
    .set({ currentStatus: status, autoRushActive: false, updatedAt: new Date() })
    .where(eq(restaurants.id, ownerRestaurant.id));

  if (ownerRestaurant.vapiAssistantId) {
    try {
      await updateVapiAssistant(ownerRestaurant.vapiAssistantId, {
        ...ownerRestaurant,
        currentStatus: status,
        autoRushActive: false,
      });
    } catch (err) {
      console.error("Erreur sync assistant VAPI après mise à jour statut cuisine :", err);
    }
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateStatusSettings(settings: StatusSettings) {
  await requireAuth();
  await requirePaidSubscription();

  const validatedSettings = statusSettingsSchema.parse(settings);

  const ownerRestaurant = await getAccessibleRestaurant();
  if (!ownerRestaurant) throw new Error("Restaurant non trouvé");

  const existingSettings = (ownerRestaurant.statusSettings as StatusSettings) || {};
  const mergedSettings: StatusSettings = { ...existingSettings, ...validatedSettings };

  await db
    .update(restaurants)
    .set({ statusSettings: mergedSettings, updatedAt: new Date() })
    .where(eq(restaurants.id, ownerRestaurant.id));

  if (ownerRestaurant.vapiAssistantId) {
    try {
      await updateVapiAssistant(ownerRestaurant.vapiAssistantId, {
        ...ownerRestaurant,
        statusSettings: mergedSettings,
      });
    } catch (err) {
      console.error("Erreur sync assistant VAPI après mise à jour paramètres cuisine :", err);
    }
  }

  revalidatePath("/dashboard");
  return { success: true };
}

