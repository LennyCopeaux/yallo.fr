import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { getAccessibleRestaurant, getAppUser, getUserOrganizations } from "@/lib/auth";
import {
  evaluateSubscriptionAccess,
  type SubscriptionAccess,
} from "@/lib/services/subscription";

export const SUBSCRIPTION_REQUIRED_ERROR =
  "Abonnement inactif : réactivez votre abonnement pour utiliser cette fonctionnalité.";

/**
 * Memoized per-request: le paywall est vérifié sur chaque page et chaque action,
 * on ne veut qu'une seule lecture de l'organisation par render.
 */
const getOrganizationBilling = cache(async (organizationId: string) => {
  const [org] = await db
    .select({
      stripeSubscriptionStatus: organizations.stripeSubscriptionStatus,
      stripeCurrentPeriodEnd: organizations.stripeCurrentPeriodEnd,
      manualAccessEnabled: organizations.manualAccessEnabled,
    })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  return org ?? null;
});

/**
 * Accès abonnement du restaurant actuellement sélectionné.
 * Résolu via l'organisation du restaurant : fonctionne aussi bien pour un
 * OWNER (membre de l'organisation) que pour un EMPLOYEE (membre du restaurant).
 */
export const getSubscriptionAccess = cache(async (): Promise<SubscriptionAccess> => {
  const user = await getAppUser();
  if (!user) {
    return evaluateSubscriptionAccess(null);
  }

  // Le panel admin n'est pas soumis au paywall.
  if (user.role === "ADMIN") {
    return {
      hasAccess: true,
      reason: "manual_access",
      status: null,
      currentPeriodEnd: null,
    };
  }

  const organizationId = await resolveBillingOrganizationId();
  if (!organizationId) {
    return evaluateSubscriptionAccess(null);
  }

  const org = await getOrganizationBilling(organizationId);
  return evaluateSubscriptionAccess(org);
});

/**
 * L'organisation qui porte l'abonnement du restaurant courant.
 * Repli sur l'organisation de l'utilisateur : un client qui paie mais dont le
 * restaurant n'est pas encore rattaché garde l'accès à son dashboard.
 */
async function resolveBillingOrganizationId(): Promise<string | null> {
  const restaurant = await getAccessibleRestaurant();
  if (restaurant?.organizationId) {
    return restaurant.organizationId;
  }

  const organizations = await getUserOrganizations();
  return organizations[0]?.id ?? null;
}

/** À utiliser en tête des server actions qui modifient des données. */
export async function requirePaidSubscription(): Promise<SubscriptionAccess> {
  const access = await getSubscriptionAccess();
  if (!access.hasAccess) {
    throw new Error(SUBSCRIPTION_REQUIRED_ERROR);
  }
  return access;
}

/**
 * Variante sans contexte d'authentification (webhooks téléphonie).
 */
export async function getSubscriptionAccessForOrganization(
  organizationId: string | null | undefined
): Promise<SubscriptionAccess> {
  if (!organizationId) {
    return evaluateSubscriptionAccess(null);
  }
  const org = await getOrganizationBilling(organizationId);
  return evaluateSubscriptionAccess(org);
}
