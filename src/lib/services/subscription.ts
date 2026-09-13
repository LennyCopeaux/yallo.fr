/**
 * Règles d'accès au dashboard restaurant.
 *
 * Un restaurant n'est utilisable que si son organisation a un abonnement Stripe
 * payé (`active` / `trialing`), ou si Yallo lui a ouvert un accès manuel
 * (pilote, partenaire, compte interne).
 */

const PAID_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export type SubscriptionAccessReason =
  | "paid"
  | "manual_access"
  | "no_organization"
  | "never_subscribed"
  | "subscription_inactive";

export type SubscriptionAccess = {
  hasAccess: boolean;
  reason: SubscriptionAccessReason;
  status: string | null;
  currentPeriodEnd: Date | null;
};

export type OrganizationBillingSnapshot = {
  stripeSubscriptionStatus: string | null;
  stripeCurrentPeriodEnd: Date | null;
  manualAccessEnabled?: boolean | null;
};

export function isPaidSubscriptionStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return PAID_SUBSCRIPTION_STATUSES.has(status.trim().toLowerCase());
}

export function evaluateSubscriptionAccess(
  org: OrganizationBillingSnapshot | null | undefined
): SubscriptionAccess {
  if (!org) {
    return {
      hasAccess: false,
      reason: "no_organization",
      status: null,
      currentPeriodEnd: null,
    };
  }

  const status = org.stripeSubscriptionStatus?.trim() || null;
  const currentPeriodEnd = org.stripeCurrentPeriodEnd ?? null;

  if (org.manualAccessEnabled) {
    return { hasAccess: true, reason: "manual_access", status, currentPeriodEnd };
  }

  if (isPaidSubscriptionStatus(status)) {
    return { hasAccess: true, reason: "paid", status, currentPeriodEnd };
  }

  return {
    hasAccess: false,
    reason: status ? "subscription_inactive" : "never_subscribed",
    status,
    currentPeriodEnd,
  };
}

/** Message affiché au restaurateur quand l'accès est bloqué. */
export function describeSubscriptionBlock(access: SubscriptionAccess): {
  title: string;
  description: string;
} {
  switch (access.reason) {
    case "subscription_inactive":
      return {
        title: "Votre abonnement n'est plus actif",
        description:
          "Le paiement de votre abonnement a échoué ou a été interrompu. Réactivez-le pour retrouver l'accès à votre dashboard et à votre assistant vocal.",
      };
    case "no_organization":
      return {
        title: "Compte non rattaché à une organisation",
        description:
          "Votre compte n'est rattaché à aucune organisation facturable. Contactez-nous à contact@yallo.fr pour finaliser la configuration.",
      };
    default:
      return {
        title: "Choisissez votre abonnement pour activer Yallo",
        description:
          "Votre dashboard, la gestion des commandes et l'assistant vocal se débloquent dès la souscription d'un plan.",
      };
  }
}
