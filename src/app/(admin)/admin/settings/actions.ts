"use server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { pricingPlans } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logger } from "@/lib/logger";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }
  return session;
}

export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

export type PricingPlan = {
  id: string;
  name: string;
  subtitle: string;
  target: string;
  monthlyPrice: number;
  setupFee: number | null;
  commissionRate: number | null;
  includedMinutes: number | null;
  overflowPricePerMinute: number | null;
  hubrise: boolean;
  popular: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
};

const updatePricingPlanSchema = z.object({
  name: z.enum(["starter", "essential", "infinity"]),
  subtitle: z.string().min(1, "Le sous-titre est requis"),
  target: z.string().min(1, "La description est requise"),
  monthlyPrice: z.number().min(0, "Prix invalide"),
  setupFee: z.number().min(0, "Frais invalides").nullable(),
  commissionRate: z.number().min(0).max(100, "Commission invalide").nullable(),
  includedMinutes: z.number().min(0, "Minutes invalides").nullable(),
  overflowPricePerMinute: z.number().min(0, "Prix invalide").nullable(),
  hubrise: z.boolean(),
  popular: z.boolean(),
});

// Ordre d'affichage : Starter, Essential, Infinity (Essential au milieu)
const PLAN_ORDER: Record<string, number> = {
  starter: 0,
  essential: 1,
  infinity: 2,
};

export async function getPricingPlans() {
  try {
    const plans = await db
      .select()
      .from(pricingPlans);

    if (plans.length === 0) {
      const defaultPlans = [
        {
          name: "starter",
          subtitle: "Test",
          target: "Pour tester l'IA sans risque",
          monthlyPrice: 2900,
          setupFee: 9900,
          commissionRate: 7,
          includedMinutes: null,
          overflowPricePerMinute: null,
          hubrise: false,
          popular: false,
        },
        {
          name: "essential",
          subtitle: "Standard",
          target: "Pour les restaurants en croissance",
          monthlyPrice: 14900,
          setupFee: null,
          commissionRate: 0,
          includedMinutes: 400,
          overflowPricePerMinute: 25,
          hubrise: true,
          popular: true,
        },
        {
          name: "infinity",
          subtitle: "Volume",
          target: "Pour les gros volumes d'appels",
          monthlyPrice: 34900,
          setupFee: null,
          commissionRate: 0,
          includedMinutes: 1200,
          overflowPricePerMinute: 20,
          hubrise: true,
          popular: false,
        },
      ];

      await db.insert(pricingPlans).values(defaultPlans);
      
      const newPlans = await db
        .select()
        .from(pricingPlans);
      
      // Trier par ordre personnalisé
      return newPlans.sort((a, b) => (PLAN_ORDER[a.name] ?? 999) - (PLAN_ORDER[b.name] ?? 999));
    }

    // Trier par ordre personnalisé
    return plans.sort((a, b) => (PLAN_ORDER[a.name] ?? 999) - (PLAN_ORDER[b.name] ?? 999));
  } catch (error) {
    logger.error("Erreur récupération plans tarifaires", error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

export async function updatePricingPlan(
  data: z.infer<typeof updatePricingPlanSchema>
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = updatePricingPlanSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données invalides" };
    }

    await db
      .update(pricingPlans)
      .set({
        subtitle: parsed.data.subtitle,
        target: parsed.data.target,
        monthlyPrice: parsed.data.monthlyPrice,
        setupFee: parsed.data.setupFee,
        commissionRate: parsed.data.commissionRate,
        includedMinutes: parsed.data.includedMinutes,
        overflowPricePerMinute: parsed.data.overflowPricePerMinute,
        hubrise: parsed.data.hubrise,
        popular: parsed.data.popular,
        updatedAt: new Date(),
      })
      .where(eq(pricingPlans.name, parsed.data.name));

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Erreur mise à jour plan tarifaire", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

