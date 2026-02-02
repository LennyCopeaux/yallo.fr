"use server";

import { db } from "@/db";
import { restaurants, type KitchenStatus } from "@/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DEFAULT_STATUS_SETTINGS } from "./constants";

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
  const session = await auth();
  if (!session?.user?.id) return null;

  const ownerRestaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, session.user.id),
    columns: { id: true, currentStatus: true, statusSettings: true },
  });

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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");

  const isValidStatus = ["CALM", "NORMAL", "RUSH", "STOP"].includes(status);
  if (!isValidStatus) throw new Error("Statut invalide");

  const ownerRestaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, session.user.id),
  });
  if (!ownerRestaurant) throw new Error("Restaurant non trouvé");

  await db
    .update(restaurants)
    .set({ currentStatus: status, updatedAt: new Date() })
    .where(eq(restaurants.id, ownerRestaurant.id));

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateStatusSettings(settings: StatusSettings) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");

  const validatedSettings = statusSettingsSchema.parse(settings);

  const ownerRestaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, session.user.id),
  });
  if (!ownerRestaurant) throw new Error("Restaurant non trouvé");

  const existingSettings = (ownerRestaurant.statusSettings as StatusSettings) || {};
  const mergedSettings: StatusSettings = { ...existingSettings, ...validatedSettings };

  await db
    .update(restaurants)
    .set({ statusSettings: mergedSettings, updatedAt: new Date() })
    .where(eq(restaurants.id, ownerRestaurant.id));

  revalidatePath("/dashboard");
  return { success: true };
}

