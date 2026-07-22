"use server";

import { db } from "@/db";
import { callLogs } from "@/db/schema";
import { eq, and, gte, lte, sum, count } from "drizzle-orm";
import { getUserOrganization } from "@/lib/auth";
import { SUBSCRIPTION_PLANS } from "@/features/billing/plans";

export type DateRangeFilter =
  | "billing_period"
  | "last_7_days"
  | "last_30_days"
  | "current_month"
  | "previous_month"
  | "all_time";

export type CallUsage = {
  minutesUsed: number;

  callCount: number;

  estimatedCostCents: number;

  callRateCentsPerMinute: number;

  periodStart: Date;

  periodEnd: Date | null;

  rangeFilter: DateRangeFilter;
};

function resolveDateRange(
  filter: DateRangeFilter,
  billingPeriodStart: Date,
  billingPeriodEnd: Date | null
): { from: Date; to: Date | null } {
  const now = new Date();
  switch (filter) {
    case "last_7_days": {
      const from = new Date(now);
      from.setDate(now.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      return { from, to: null };
    }
    case "last_30_days": {
      const from = new Date(now);
      from.setDate(now.getDate() - 29);
      from.setHours(0, 0, 0, 0);
      return { from, to: null };
    }
    case "current_month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to: null };
    }
    case "previous_month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { from, to };
    }
    case "all_time":
      return { from: new Date(0), to: null };
    case "billing_period":
    default:
      return { from: billingPeriodStart, to: billingPeriodEnd };
  }
}

export async function getCallUsageForCurrentPeriod(
  rangeFilter: DateRangeFilter = "billing_period"
): Promise<
  { success: true; data: CallUsage } | { success: false; error: string }
> {
  const org = await getUserOrganization();
  if (!org) {
    return { success: false, error: "Aucune organisation trouvée." };
  }

  const now = new Date();
  let billingPeriodStart: Date;

  if (org.billingStartDate) {
    const startDate = new Date(org.billingStartDate);
    billingPeriodStart = new Date(startDate);
    billingPeriodStart.setFullYear(now.getFullYear(), now.getMonth());
    if (billingPeriodStart > now) {
      billingPeriodStart.setMonth(billingPeriodStart.getMonth() - 1);
    }
  } else {
    billingPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const billingPeriodEnd = org.stripeCurrentPeriodEnd ?? null;
  const { from, to } = resolveDateRange(rangeFilter, billingPeriodStart, billingPeriodEnd);

  const conditions = [
    eq(callLogs.organizationId, org.id),
    gte(callLogs.createdAt, from),
    ...(to ? [lte(callLogs.createdAt, to)] : []),
  ];

  const [result] = await db
    .select({
      totalSeconds: sum(callLogs.durationSeconds),
      callCount: count(callLogs.id),
    })
    .from(callLogs)
    .where(and(...conditions));

  const totalSeconds = Number(result?.totalSeconds ?? 0);
  const callCount = result?.callCount ?? 0;
  const minutesUsed = totalSeconds > 0 ? Math.ceil(totalSeconds / 60) : 0;

  const activePlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === org.stripePriceId) ?? SUBSCRIPTION_PLANS[0];
  const callRateCentsPerMinute = activePlan.callRateCentsPerMinute;
  const estimatedCostCents = minutesUsed * callRateCentsPerMinute;

  return {
    success: true,
    data: {
      minutesUsed,
      callCount,
      estimatedCostCents,
      callRateCentsPerMinute,
      periodStart: from,
      periodEnd: to,
      rangeFilter,
    },
  };
}

