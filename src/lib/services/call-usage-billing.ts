import type Stripe from "stripe";
import { and, eq, gt, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { callLogs, organizations } from "@/db/schema";
import { logger } from "@/lib/logger";
import { SUBSCRIPTION_PLANS } from "@/features/billing/plans";
import { getStripeServerClient } from "./stripe";

/**
 * Facturation des minutes d'appel.
 *
 * L'abonnement Stripe couvre l'abonnement mensuel fixe ; les minutes d'appel
 * sont ajoutees comme ligne supplementaire sur la facture d'abonnement suivante,
 * au moment ou Stripe cree le brouillon (`invoice.created`).
 *
 * On facture "tout ce qui n'est pas encore facture" plutot qu'une periode
 * calculee : pas de trou si un webhook est manque, pas de doublon si un appel
 * arrive en retard.
 */

const BILLABLE_INVOICE_REASONS = new Set([
  "subscription_create",
  "subscription_cycle",
  "subscription_update",
]);

export type UsageInvoiceAmount = {
  minutes: number;
  amountCents: number;
};

/** Les minutes commencees sont dues : Stripe facture a la minute entamee. */
export function computeUsageInvoiceAmount(
  totalSeconds: number,
  callRateCentsPerMinute: number
): UsageInvoiceAmount {
  if (totalSeconds <= 0 || callRateCentsPerMinute <= 0) {
    return { minutes: 0, amountCents: 0 };
  }

  const minutes = Math.ceil(totalSeconds / 60);
  return { minutes, amountCents: minutes * callRateCentsPerMinute };
}

export function getCallRateCentsPerMinute(planId: string | null | undefined): number {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId) ?? SUBSCRIPTION_PLANS[0];
  return plan.callRateCentsPerMinute;
}

/**
 * Une facture ne peut recevoir de ligne de consommation que si elle est encore
 * un brouillon rattache a un abonnement.
 */
export function isBillableUsageInvoice(invoice: Stripe.Invoice): boolean {
  if (invoice.status !== "draft") return false;
  if (!invoice.billing_reason) return false;
  return BILLABLE_INVOICE_REASONS.has(invoice.billing_reason);
}

export function buildUsageDescription(minutes: number, ratePerMinuteCents: number): string {
  const rate = (ratePerMinuteCents / 100).toFixed(2).replace(".", ",");
  return `Minutes d'appel IA — ${minutes} min à ${rate} €/min`;
}

export type UsageBillingResult =
  | { billed: false; reason: "not_billable" | "no_organization" | "no_usage" }
  | { billed: true; minutes: number; amountCents: number; callLogIds: string[] };

/**
 * Ajoute la consommation d'appels non facturee au brouillon de facture Stripe.
 */
export async function billPendingCallUsage(
  invoice: Stripe.Invoice
): Promise<UsageBillingResult> {
  if (!isBillableUsageInvoice(invoice)) {
    return { billed: false, reason: "not_billable" };
  }

  const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
  if (!customerId || !invoice.id) {
    return { billed: false, reason: "no_organization" };
  }

  const [org] = await db
    .select({
      id: organizations.id,
      planId: organizations.stripePriceId,
    })
    .from(organizations)
    .where(eq(organizations.stripeCustomerId, customerId))
    .limit(1);

  if (!org) {
    logger.warn("Facture Stripe sans organisation correspondante", {
      invoiceId: invoice.id,
      customerId,
    });
    return { billed: false, reason: "no_organization" };
  }

  const pendingCalls = await db
    .select({
      id: callLogs.id,
      durationSeconds: callLogs.durationSeconds,
    })
    .from(callLogs)
    .where(
      and(
        eq(callLogs.organizationId, org.id),
        isNull(callLogs.billedAt),
        gt(callLogs.durationSeconds, 0)
      )
    );

  const totalSeconds = pendingCalls.reduce((sum, call) => sum + call.durationSeconds, 0);
  const callRateCentsPerMinute = getCallRateCentsPerMinute(org.planId);
  const { minutes, amountCents } = computeUsageInvoiceAmount(
    totalSeconds,
    callRateCentsPerMinute
  );

  if (amountCents <= 0) {
    return { billed: false, reason: "no_usage" };
  }

  const stripe = getStripeServerClient();

  await stripe.invoiceItems.create(
    {
      customer: customerId,
      invoice: invoice.id,
      amount: amountCents,
      currency: invoice.currency ?? "eur",
      description: buildUsageDescription(minutes, callRateCentsPerMinute),
      metadata: {
        organizationId: org.id,
        minutes: String(minutes),
        callCount: String(pendingCalls.length),
      },
    },
    // Rejoue sans risque : Stripe refuse un second appel avec la meme cle.
    { idempotencyKey: `call-usage-${invoice.id}` }
  );

  const callLogIds = pendingCalls.map((call) => call.id);

  await db
    .update(callLogs)
    .set({ billedAt: sql`now()`, stripeInvoiceId: invoice.id })
    .where(inArray(callLogs.id, callLogIds));

  logger.info("Minutes d'appel ajoutees a la facture Stripe", {
    invoiceId: invoice.id,
    organizationId: org.id,
    minutes,
    amountCents,
    callCount: callLogIds.length,
  });

  return { billed: true, minutes, amountCents, callLogIds };
}
