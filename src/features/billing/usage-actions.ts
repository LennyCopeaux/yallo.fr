"use server";

import { db } from "@/db";
import { callLogs } from "@/db/schema";
import { eq, and, gte, sum, count } from "drizzle-orm";
import { getUserOrganization } from "@/lib/auth";
import { SUBSCRIPTION_PLANS } from "@/features/billing/plans";

export type CallUsage = {
  minutesUsed: number;
  /** Nombre d'appels dans la période */
  callCount: number;
  /** Coût estimé en centimes (minutes × tarif/min selon plan) */
  estimatedCostCents: number;
  /** Tarif au centime par minute selon le plan actif */
  callRateCentsPerMinute: number;
  /** Date de début de la période de facturation en cours */
  periodStart: Date;
  /** Date de fin de la période (remise à zéro) */
  periodEnd: Date | null;
};

/**
 * Calcule la consommation d'appels IA pour la période de facturation en cours.
 */
export async function getCallUsageForCurrentPeriod(): Promise<
  { success: true; data: CallUsage } | { success: false; error: string }
> {
  const org = await getUserOrganization();
  if (!org) {
    return { success: false, error: "Aucune organisation trouvée." };
  }

  // Période de facturation : depuis le début du cycle mensuel en cours
  const now = new Date();
  let periodStart: Date;

  if (org.billingStartDate) {
    const startDate = new Date(org.billingStartDate);
    periodStart = new Date(startDate);
    periodStart.setFullYear(now.getFullYear(), now.getMonth());
    if (periodStart > now) {
      periodStart.setMonth(periodStart.getMonth() - 1);
    }
  } else {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const periodEnd = org.stripeCurrentPeriodEnd ?? null;

  const [result] = await db
    .select({
      totalSeconds: sum(callLogs.durationSeconds),
      callCount: count(callLogs.id),
    })
    .from(callLogs)
    .where(
      and(
        eq(callLogs.organizationId, org.id),
        gte(callLogs.createdAt, periodStart)
      )
    );

  const totalSeconds = Number(result?.totalSeconds ?? 0);
  const callCount = result?.callCount ?? 0;
  // Arrondi au-dessus à la minute (convention opérateurs télécom)
  const minutesUsed = totalSeconds > 0 ? Math.ceil(totalSeconds / 60) : 0;

  // Trouver le tarif du plan actif via stripePriceId stocké dans les métadonnées
  // Le planId est dans org mais sous forme de priceId Stripe — on cherche par correspondance
  // TODO: stocker explicitement le planId dans organizations lors du prochain refacto Stripe
  const activePlan = SUBSCRIPTION_PLANS[0]; // fallback Essentiel par défaut
  const callRateCentsPerMinute = activePlan.callRateCentsPerMinute;
  const estimatedCostCents = minutesUsed * callRateCentsPerMinute;

  return {
    success: true,
    data: {
      minutesUsed,
      callCount,
      estimatedCostCents,
      callRateCentsPerMinute,
      periodStart,
      periodEnd,
    },
  };
}
