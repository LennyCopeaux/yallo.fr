"use server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { pricingConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }
  return session;
}

const updatePricingConfigSchema = z.object({
  monthlyPrice: z.number().min(0, "Prix invalide"),
  setupFee: z.number().min(0, "Frais invalides"),
  includedMinutes: z.number().min(0, "Minutes invalides"),
  overflowPricePerMinute: z.number().min(0, "Prix invalide"),
});

export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

export async function getPricingConfig() {
  try {
    const [config] = await db
      .select()
      .from(pricingConfig)
      .limit(1);

    if (!config) {
      // Créer la config par défaut si elle n'existe pas
      const [newConfig] = await db
        .insert(pricingConfig)
        .values({
          monthlyPrice: 14900,
          setupFee: 19900,
          includedMinutes: 600,
          overflowPricePerMinute: 20,
        })
        .returning();
      return newConfig;
    }

    return config;
  } catch (error) {
    console.error("Erreur récupération config prix:", error);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      id: "",
      monthlyPrice: 14900,
      setupFee: 19900,
      includedMinutes: 600,
      overflowPricePerMinute: 20,
      updatedAt: new Date(),
    };
  }
}

export async function updatePricingConfig(
  data: z.infer<typeof updatePricingConfigSchema>
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = updatePricingConfigSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données invalides" };
    }

    // Récupérer ou créer la config
    const [existing] = await db.select().from(pricingConfig).limit(1);

    if (existing) {
      // Mettre à jour
      await db
        .update(pricingConfig)
        .set({
          monthlyPrice: parsed.data.monthlyPrice,
          setupFee: parsed.data.setupFee,
          includedMinutes: parsed.data.includedMinutes,
          overflowPricePerMinute: parsed.data.overflowPricePerMinute,
          updatedAt: new Date(),
        })
        .where(eq(pricingConfig.id, existing.id));
    } else {
      // Créer
      await db.insert(pricingConfig).values({
        monthlyPrice: parsed.data.monthlyPrice,
        setupFee: parsed.data.setupFee,
        includedMinutes: parsed.data.includedMinutes,
        overflowPricePerMinute: parsed.data.overflowPricePerMinute,
      });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/"); // Revalider la page marketing
    return { success: true };
  } catch (error) {
    console.error("Erreur mise à jour config prix:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

