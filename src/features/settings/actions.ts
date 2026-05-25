"use server";

import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateElevenLabsAgent } from "@/lib/services/elevenlabs-agent";
import { toFrenchLocalPhoneNumber } from "@/lib/utils";

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

export type CallForwardingSettings = {
  twilioPhoneNumber: string | null;
  restaurantPhoneNumber: string;
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
      phoneNumber: restaurants.phoneNumber,
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
      restaurantPhoneNumber: ownerRestaurant.phoneNumber,
      callForwardingEnabled: ownerRestaurant.callForwardingEnabled,
    } satisfies CallForwardingSettings,
  };
}

const updateCallForwardingSchema = z.object({
  restaurantPhoneNumber: z
    .string()
    .trim()
    .min(1, "Le numéro principal du restaurant est requis"),
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

  const { restaurantPhoneNumber: rawRestaurantPhone, callForwardingEnabled } = parsed.data;

  const localRestaurantPhone = toFrenchLocalPhoneNumber(rawRestaurantPhone);
  if (!localRestaurantPhone) {
    return {
      success: false,
      error: "Numéro principal invalide. Utilisez le format 0XXXXXXXXX.",
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
      phoneNumber: localRestaurantPhone,
      callForwardingEnabled,
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, ownerRestaurant.id));

  // Sync agent if it exists
  if (ownerRestaurant.elevenLabsAgentId) {
    try {
      const updatedRestaurant = {
        ...ownerRestaurant,
        phoneNumber: localRestaurantPhone,
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

// ─── Assistant behaviour settings ────────────────────────────────────────────

export type AssistantSettings = {
  elevenLabsVoiceId: string | null;
  upsellEnabled: boolean;
  smsConfirmationEnabled: boolean;
  autoRushThreshold: number | null;
};

export async function getAssistantSettings(): Promise<ActionResult> {
  const user = await requireAuth();
  if (user.role === "ADMIN") {
    return { success: false, error: "Un restaurant doit être spécifié pour les admins" };
  }

  const [ownerRestaurant] = await db
    .select({
      elevenLabsVoiceId: restaurants.elevenLabsVoiceId,
      upsellEnabled: restaurants.upsellEnabled,
      smsConfirmationEnabled: restaurants.smsConfirmationEnabled,
      autoRushThreshold: restaurants.autoRushThreshold,
    })
    .from(restaurants)
    .where(eq(restaurants.ownerId, user.id))
    .limit(1);

  if (!ownerRestaurant) return { success: false, error: "Aucun restaurant trouvé" };

  return {
    success: true,
    data: {
      elevenLabsVoiceId: ownerRestaurant.elevenLabsVoiceId ?? null,
      upsellEnabled: ownerRestaurant.upsellEnabled,
      smsConfirmationEnabled: ownerRestaurant.smsConfirmationEnabled,
      autoRushThreshold: ownerRestaurant.autoRushThreshold ?? null,
    } satisfies AssistantSettings,
  };
}

const updateVoiceSchema = z.object({
  voiceId: z.string().trim().min(1),
});

export async function updateVoiceId(
  input: z.infer<typeof updateVoiceSchema>
): Promise<ActionResult> {
  const user = await requireAuth();
  if (user.role === "ADMIN") {
    return { success: false, error: "Un restaurant doit être spécifié pour les admins" };
  }

  const parsed = updateVoiceSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const [ownerRestaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.ownerId, user.id))
    .limit(1);

  if (!ownerRestaurant) return { success: false, error: "Aucun restaurant trouvé" };

  await db
    .update(restaurants)
    .set({ elevenLabsVoiceId: parsed.data.voiceId, updatedAt: new Date() })
    .where(eq(restaurants.id, ownerRestaurant.id));

  if (ownerRestaurant.elevenLabsAgentId) {
    try {
      await updateElevenLabsAgent(ownerRestaurant.elevenLabsAgentId, {
        ...ownerRestaurant,
        elevenLabsVoiceId: parsed.data.voiceId,
      });
    } catch (err) {
      console.error("Erreur sync agent ElevenLabs après mise à jour voix :", err);
    }
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

const updateAssistantBehaviourSchema = z.object({
  upsellEnabled: z.boolean(),
  smsConfirmationEnabled: z.boolean(),
  autoRushThreshold: z.number().int().positive().nullable(),
});

export async function updateAssistantBehaviour(
  input: z.infer<typeof updateAssistantBehaviourSchema>
): Promise<ActionResult> {
  const user = await requireAuth();
  if (user.role === "ADMIN") {
    return { success: false, error: "Un restaurant doit être spécifié pour les admins" };
  }

  const parsed = updateAssistantBehaviourSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const [ownerRestaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.ownerId, user.id))
    .limit(1);

  if (!ownerRestaurant) return { success: false, error: "Aucun restaurant trouvé" };

  await db
    .update(restaurants)
    .set({
      upsellEnabled: parsed.data.upsellEnabled,
      smsConfirmationEnabled: parsed.data.smsConfirmationEnabled,
      autoRushThreshold: parsed.data.autoRushThreshold,
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, ownerRestaurant.id));

  if (ownerRestaurant.elevenLabsAgentId) {
    try {
      await updateElevenLabsAgent(ownerRestaurant.elevenLabsAgentId, {
        ...ownerRestaurant,
        upsellEnabled: parsed.data.upsellEnabled,
        smsConfirmationEnabled: parsed.data.smsConfirmationEnabled,
        autoRushThreshold: parsed.data.autoRushThreshold,
      });
    } catch (err) {
      console.error("Erreur sync agent ElevenLabs après mise à jour comportement :", err);
    }
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

// ─── ElevenLabs voice list ────────────────────────────────────────────────────

export type ElevenLabsVoice = {
  voice_id: string;
  name: string;
  labels: Record<string, string>;
  preview_url: string | null;
};

const ALLOWED_VOICE_IDS = [
  "5l4ttmr4SKNgi0HnOelT",
  "wiyskUVLAs33lrFT4z4v",
  "KSyQzmsYhFbuOhqj1Xxv",
  "fBpCO0Kf0krKLYGOu65w",
  "aF9wTE4apSrh9D2pdwwI",
] as const;

export async function listElevenLabsVoices(): Promise<ActionResult> {
  const user = await requireAuth();
  if (user.role === "ADMIN") {
    return { success: false, error: "Réservé aux restaurateurs" };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) return { success: false, error: "API ElevenLabs non configurée" };

  try {
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": apiKey },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { success: false, error: "Impossible de récupérer les voix ElevenLabs" };
    }

    const json = (await response.json()) as { voices: ElevenLabsVoice[] };
    const voices = json.voices.map((v) => ({
      voice_id: v.voice_id,
      name: v.name,
      labels: v.labels ?? {},
      preview_url: v.preview_url ?? null,
    }));

    const lucieVoice = voices.find((voice) =>
      voice.name.trim().toLowerCase().includes("lucie")
    );

    const voiceById = new Map(voices.map((voice) => [voice.voice_id, voice]));

    const missingAllowedIds = ALLOWED_VOICE_IDS.filter((voiceId) => !voiceById.has(voiceId));

    // Some curated voices can be in ElevenLabs Voice Library without being returned by /v1/voices.
    // Fetch them explicitly by ID so owners can still select them.
    const fetchedMissingVoices = await Promise.all(
      missingAllowedIds.map(async (voiceId) => {
        try {
          const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
            headers: { "xi-api-key": apiKey },
            next: { revalidate: 3600 },
          });

          if (!voiceResponse.ok) return null;

          const voiceJson = (await voiceResponse.json()) as Partial<ElevenLabsVoice>;
          if (!voiceJson.voice_id || !voiceJson.name) return null;

          return {
            voice_id: voiceJson.voice_id,
            name: voiceJson.name,
            labels: voiceJson.labels ?? {},
            preview_url: voiceJson.preview_url ?? null,
          } satisfies ElevenLabsVoice;
        } catch {
          return null;
        }
      })
    );

    for (const voice of fetchedMissingVoices) {
      if (!voice) continue;
      voiceById.set(voice.voice_id, voice);
    }

    const curatedVoices: ElevenLabsVoice[] = [];

    if (lucieVoice) {
      curatedVoices.push(lucieVoice);
    }

    for (const voiceId of ALLOWED_VOICE_IDS) {
      const voice = voiceById.get(voiceId);
      if (!voice) continue;
      if (curatedVoices.some((existing) => existing.voice_id === voice.voice_id)) continue;
      curatedVoices.push(voice);
    }

    return { success: true, data: curatedVoices };
  } catch {
    return { success: false, error: "Erreur lors de la récupération des voix" };
  }
}
