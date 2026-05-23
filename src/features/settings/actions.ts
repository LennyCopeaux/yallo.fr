"use server";

import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateElevenLabsAgent } from "@/lib/services/elevenlabs-agent";
import { normalizeFrenchPhoneNumber } from "@/lib/utils";

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

export type CallForwardingSettings = {
  twilioPhoneNumber: string | null;
  forwardingPhoneNumber: string | null;
  callForwardingEnabled: boolean;
};

export async function getCallForwardingSettings(): Promise<ActionResult> {
  const user = await requireAuth();
  if (user.role === "ADMIN") {
    return { success: false, error: "Un restaurant doit être spécifié pour les admins" };
  }

  const [ownerRestaurant] = await db
    .select({
      twilioPhoneNumber: restaurants.twilioPhoneNumber,
      forwardingPhoneNumber: restaurants.forwardingPhoneNumber,
      callForwardingEnabled: restaurants.callForwardingEnabled,
    })
    .from(restaurants)
    .where(eq(restaurants.ownerId, user.id))
    .limit(1);

  if (!ownerRestaurant) return { success: false, error: "Aucun restaurant trouvé" };

  return {
    success: true,
    data: {
      twilioPhoneNumber: ownerRestaurant.twilioPhoneNumber ?? null,
      forwardingPhoneNumber: ownerRestaurant.forwardingPhoneNumber ?? null,
      callForwardingEnabled: ownerRestaurant.callForwardingEnabled,
    } satisfies CallForwardingSettings,
  };
}

const updateCallForwardingSchema = z.object({
  forwardingPhoneNumber: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  callForwardingEnabled: z.boolean(),
});

export async function updateCallForwardingSettings(
  input: z.infer<typeof updateCallForwardingSchema>
): Promise<ActionResult> {
  const user = await requireAuth();
  if (user.role === "ADMIN") {
    return { success: false, error: "Un restaurant doit être spécifié pour les admins" };
  }

  const parsed = updateCallForwardingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Données invalides" };
  }

  const { forwardingPhoneNumber: rawForwarding, callForwardingEnabled } = parsed.data;

  // Validate and normalize phone number if provided
  let normalizedForwarding: string | null = null;
  if (rawForwarding) {
    const normalized = normalizeFrenchPhoneNumber(rawForwarding);
    if (!normalized) {
      return {
        success: false,
        error:
          "Numéro de redirection invalide. Utilisez le format +33XXXXXXXXX ou 0XXXXXXXXX.",
      };
    }
    normalizedForwarding = normalized;
  }

  // If forwarding is enabled, a number is required
  if (callForwardingEnabled && !normalizedForwarding) {
    return {
      success: false,
      error:
        "Veuillez renseigner un numéro de redirection avant d'activer le transfert d'appel.",
    };
  }

  const [ownerRestaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.ownerId, user.id))
    .limit(1);

  if (!ownerRestaurant) return { success: false, error: "Aucun restaurant trouvé" };

  await db
    .update(restaurants)
    .set({
      forwardingPhoneNumber: normalizedForwarding,
      callForwardingEnabled,
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, ownerRestaurant.id));

  // Sync agent if it exists
  if (ownerRestaurant.elevenLabsAgentId) {
    try {
      const updatedRestaurant = {
        ...ownerRestaurant,
        forwardingPhoneNumber: normalizedForwarding,
        callForwardingEnabled,
      };
      await updateElevenLabsAgent(ownerRestaurant.elevenLabsAgentId, updatedRestaurant);
    } catch (err) {
      // Don't fail the save — agent sync is best-effort
      console.error("Erreur sync agent ElevenLabs après mise à jour forwarding :", err);
    }
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}
