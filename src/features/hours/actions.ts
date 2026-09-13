"use server";

import { requireAuth, getAccessibleRestaurant } from "@/lib/auth";
import { getSubscriptionAccess } from "@/lib/subscription-access";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateVapiAssistant } from "@/lib/services/vapi-agent";

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
  const user = await requireAuth();
  if (user.role === "ADMIN") {
    return { success: false, error: "Un restaurant doit être spécifié pour les admins" };
  }
  if (user.role === "EMPLOYEE") {
    return { success: false, error: "Accès non autorisé" };
  }

  const restaurant = await getAccessibleRestaurant();
  if (!restaurant) return { success: false, error: "Aucun restaurant trouvé" };
  if (!restaurant.businessHours) {
    return { success: true, data: { timezone: "Europe/Paris", schedule: {} } };
  }

  try {
    const parsedHours = JSON.parse(restaurant.businessHours);
    const validationResult = businessHoursSchema.safeParse(parsedHours);
    if (!validationResult.success || !parsedHours.schedule || Object.keys(parsedHours.schedule).length === 0) {
      return { success: true, data: { timezone: "Europe/Paris", schedule: {} } };
    }
    return { success: true, data: validationResult.data };
  } catch {
    return { success: true, data: { timezone: "Europe/Paris", schedule: {} } };
  }
}

export async function updateBusinessHours(formData: FormData): Promise<ActionResult> {
  const user = await requireAuth();
  if (user.role === "ADMIN") {
    return { success: false, error: "Un restaurant doit être spécifié pour les admins" };
  }
  if (user.role === "EMPLOYEE") {
    return { success: false, error: "Accès non autorisé" };
  }

  const restaurant = await getAccessibleRestaurant();
  if (!restaurant) return { success: false, error: "Aucun restaurant trouvé" };

  const access = await getSubscriptionAccess();
  if (!access.hasAccess) {
    return {
      success: false,
      error: "Abonnement inactif : réactivez votre abonnement pour modifier les horaires.",
    };
  }

  const hoursInput = formData.get("businessHours");
  if (!hoursInput || typeof hoursInput !== "string") {
    return { success: false, error: "Horaires invalides" };
  }

  try {
    const parsedHours = JSON.parse(hoursInput);
    const validatedHours = businessHoursSchema.parse({ ...parsedHours, timezone: "Europe/Paris" });

    await db
      .update(restaurants)
      .set({ businessHours: JSON.stringify(validatedHours), updatedAt: new Date() })
      .where(eq(restaurants.id, restaurant.id));

    if (restaurant.vapiAssistantId) {
      try {
        await updateVapiAssistant(restaurant.vapiAssistantId, {
          ...restaurant,
          businessHours: JSON.stringify(validatedHours),
        });
      } catch (err) {
        console.error("Erreur sync assistant VAPI après mise à jour horaires :", err);
      }
    }

    revalidatePath("/dashboard/hours");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: "Format des horaires invalide" };
    return { success: false, error: "Erreur lors de la sauvegarde" };
  }
}

