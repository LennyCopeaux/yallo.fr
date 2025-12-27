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

export async function getBusinessHours(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  if (session.user.role === "ADMIN") {
    return { success: false, error: "Un restaurant doit être spécifié pour les admins" };
  }

  const [restaurant] = await db
    .select({ businessHours: restaurants.businessHours })
    .from(restaurants)
    .where(eq(restaurants.ownerId, session.user.id))
    .limit(1);

  if (!restaurant) {
    return { success: false, error: "Aucun restaurant trouvé" };
  }

  if (!restaurant.businessHours) {
    const defaultHours = {
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
    return { success: true, data: defaultHours };
  }

  const getDefaultHours = () => ({
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
  });

  try {
    const parsed = JSON.parse(restaurant.businessHours);
    const validated = businessHoursSchema.safeParse(parsed);
    if (validated.success) {
      return { success: true, data: validated.data };
    }
    return { success: true, data: getDefaultHours() };
  } catch {
    return { success: true, data: getDefaultHours() };
  }
}

export async function updateBusinessHours(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  if (session.user.role === "ADMIN") {
    return { success: false, error: "Un restaurant doit être spécifié pour les admins" };
  }

  const [restaurant] = await db
    .select({ id: restaurants.id })
    .from(restaurants)
    .where(eq(restaurants.ownerId, session.user.id))
    .limit(1);

  if (!restaurant) {
    return { success: false, error: "Aucun restaurant trouvé" };
  }

  const businessHoursJson = formData.get("businessHours");
  if (!businessHoursJson || typeof businessHoursJson !== "string") {
    return { success: false, error: "Horaires invalides" };
  }

  try {
    const parsed = JSON.parse(businessHoursJson);
    const validated = businessHoursSchema.parse({
      ...parsed,
      timezone: "Europe/Paris",
    });

    await db
      .update(restaurants)
      .set({ businessHours: JSON.stringify(validated) })
      .where(eq(restaurants.id, restaurant.id));

    revalidatePath("/dashboard/hours");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Format des horaires invalide" };
    }
    return { success: false, error: "Erreur lors de la sauvegarde" };
  }
}

