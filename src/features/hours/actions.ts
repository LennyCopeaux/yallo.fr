"use server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const timeSlotSchema = z.object({
  open: z.string(),
  close: z.string(),
});

const dayScheduleSchema = z.union([
  z.object({
    open: z.string(),
    close: z.string(),
  }),
  z.object({
    lunch: timeSlotSchema,
    dinner: timeSlotSchema,
  }),
]);

const businessHoursSchema = z.object({
  timezone: z.string().default("Europe/Paris"),
  schedule: z.record(z.string(), dayScheduleSchema.optional()),
});

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

const DEFAULT_BUSINESS_HOURS = {
  timezone: "Europe/Paris",
  schedule: {
    monday: { open: "11:00", close: "22:00" },
    tuesday: { open: "11:00", close: "22:00" },
    wednesday: { open: "11:00", close: "22:00" },
    thursday: { open: "11:00", close: "22:00" },
    friday: { open: "11:00", close: "23:00" },
    saturday: { open: "11:00", close: "23:00" },
    sunday: { open: "11:00", close: "22:00" },
  },
};

export async function getBusinessHours(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorisé" };
  if (session.user.role === "ADMIN") {
    return { success: false, error: "Un restaurant doit être spécifié pour les admins" };
  }

  const [ownerRestaurant] = await db
    .select({ businessHours: restaurants.businessHours })
    .from(restaurants)
    .where(eq(restaurants.ownerId, session.user.id))
    .limit(1);

  if (!ownerRestaurant) return { success: false, error: "Aucun restaurant trouvé" };
  if (!ownerRestaurant.businessHours) return { success: true, data: DEFAULT_BUSINESS_HOURS };

  try {
    const parsedHours = JSON.parse(ownerRestaurant.businessHours);
    const validationResult = businessHoursSchema.safeParse(parsedHours);
    return { success: true, data: validationResult.success ? validationResult.data : DEFAULT_BUSINESS_HOURS };
  } catch {
    return { success: true, data: DEFAULT_BUSINESS_HOURS };
  }
}

export async function updateBusinessHours(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorisé" };
  if (session.user.role === "ADMIN") {
    return { success: false, error: "Un restaurant doit être spécifié pour les admins" };
  }

  const [ownerRestaurant] = await db
    .select({ id: restaurants.id })
    .from(restaurants)
    .where(eq(restaurants.ownerId, session.user.id))
    .limit(1);

  if (!ownerRestaurant) return { success: false, error: "Aucun restaurant trouvé" };

  const hoursInput = formData.get("businessHours");
  if (!hoursInput || typeof hoursInput !== "string") {
    return { success: false, error: "Horaires invalides" };
  }

  try {
    const parsedHours = JSON.parse(hoursInput);
    const validatedHours = businessHoursSchema.parse({ ...parsedHours, timezone: "Europe/Paris" });

    await db
      .update(restaurants)
      .set({ businessHours: JSON.stringify(validatedHours) })
      .where(eq(restaurants.id, ownerRestaurant.id));

    revalidatePath("/dashboard/hours");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: "Format des horaires invalide" };
    return { success: false, error: "Erreur lors de la sauvegarde" };
  }
}

