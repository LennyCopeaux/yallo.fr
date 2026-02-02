"use server";

import { db } from "@/db";
import { restaurants, type KitchenStatus } from "@/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DEFAULT_STATUS_SETTINGS } from "./constants";

// Schéma de validation pour les paramètres de statut
// Soit délai fixe (fixed), soit plage horaire (range avec min/max)
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

// Récupérer le restaurant avec son statut actuel
export async function getKitchenStatus() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, session.user.id),
    columns: {
      id: true,
      currentStatus: true,
      statusSettings: true,
    },
  });

  if (!restaurant) {
    return null;
  }

  // Si pas de settings, initialiser avec les valeurs par défaut en BDD
  if (!restaurant.statusSettings) {
    await db
      .update(restaurants)
      .set({
        statusSettings: DEFAULT_STATUS_SETTINGS,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurant.id));

    return {
      ...restaurant,
      statusSettings: DEFAULT_STATUS_SETTINGS,
    };
  }

  return restaurant;
}

// Mettre à jour le statut actif de la cuisine
export async function updateKitchenStatus(status: KitchenStatus) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  // Vérifier que le statut est valide
  if (!["CALM", "NORMAL", "RUSH", "STOP"].includes(status)) {
    throw new Error("Statut invalide");
  }

  // Trouver le restaurant de l'utilisateur
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, session.user.id),
  });

  if (!restaurant) {
    throw new Error("Restaurant non trouvé");
  }

  // Mettre à jour le statut
  await db
    .update(restaurants)
    .set({ 
      currentStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, restaurant.id));

  revalidatePath("/dashboard");
  return { success: true };
}

// Sauvegarder la configuration des temps d'attente
export async function updateStatusSettings(settings: StatusSettings) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  // Valider les données
  const validatedSettings = statusSettingsSchema.parse(settings);

  // Trouver le restaurant de l'utilisateur
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, session.user.id),
  });

  if (!restaurant) {
    throw new Error("Restaurant non trouvé");
  }

  // Fusionner avec les paramètres existants
  const currentSettings = (restaurant.statusSettings as StatusSettings) || {};
  const mergedSettings: StatusSettings = {
    ...currentSettings,
    ...validatedSettings,
  };

  // Mettre à jour les paramètres
  await db
    .update(restaurants)
    .set({ 
      statusSettings: mergedSettings,
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, restaurant.id));

  revalidatePath("/dashboard");
  return { success: true };
}

