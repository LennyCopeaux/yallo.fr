"use client";

import { useTransition, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check, CreditCard, Sparkles, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createStripeCheckoutSessionForRestaurant,
  createStripePortalSession,
} from "@/features/billing/actions";
import { type PlanId, SUBSCRIPTION_PLANS } from "@/features/billing/plans";
import { useEffect } from "react";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

type Plan = (typeof SUBSCRIPTION_PLANS)[number];

interface BillingPageContentProps {
  restaurant: {
    stripeSubscriptionStatus: string | null;
    stripePriceId: string | null;
    billingStartDate: string | null;
    stripeCustomerId: string | null;
  };
  restaurantCount: number;
  plans: readonly Plan[];
  orgId?: string;
}

function normalizeFeature(feature: string): string {
  return feature.trim().toLowerCase();
}

export function BillingPageContent({ restaurant, restaurantCount, plans, orgId }: Readonly<BillingPageContentProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  const isActive = restaurant.stripeSubscriptionStatus
    ? ACTIVE_STATUSES.has(restaurant.stripeSubscriptionStatus)
    : false;

  useEffect(() => {
    const billing = searchParams.get("billing");
    const returnPath = orgId ? `/org/${orgId}` : "/dashboard/billing";
    if (billing === "success") {
      toast.success("Abonnement activé avec succès !");
      router.replace(returnPath);
    } else if (billing === "cancel") {
      toast.info("Paiement annulé.");
      router.replace(returnPath);
    }
  }, [searchParams, router]);

  const handleSubscribe = (planId: PlanId) => {
    setLoadingPlan(planId);
    startTransition(async () => {
      const result = await createStripeCheckoutSessionForRestaurant(planId);
      setLoadingPlan(null);
      if (!result.success || !result.data?.checkoutUrl) {
        toast.error(result.error ?? "Impossible d'ouvrir Stripe Checkout.");
        return;
      }
      router.push(result.data.checkoutUrl);
    });
  };

  const handleManage = () => {
    startTransition(async () => {
      const result = await createStripePortalSession();
      if (!result.success || !result.data?.checkoutUrl) {
        toast.error(result.error ?? "Impossible d'ouvrir le portail Stripe.");
        return;
      }
      router.push(result.data.checkoutUrl);
    });
  };

  const formatFeatureLabel = (planId: PlanId, feature: string): string => {
    if (planId === "infinity" && feature === "1 numéro de téléphone dédié par restaurant") {
      return `${restaurantCount} numéro${restaurantCount > 1 ? "s" : ""} dédié${restaurantCount > 1 ? "s" : ""} (${restaurantCount} restaurant${restaurantCount > 1 ? "s" : ""})`;
    }
    return feature;
  };

  const getIncrementalFeatures = (plan: Plan, previousPlan?: Plan): string[] => {
    if (!previousPlan) {
      return plan.included.map((feature) => formatFeatureLabel(plan.id as PlanId, feature));
    }

    const previousSet = new Set(previousPlan.included.map((feature) => normalizeFeature(feature)));
    return plan.included
      .filter((feature) => !previousSet.has(normalizeFeature(feature)))
      .map((feature) => formatFeatureLabel(plan.id as PlanId, feature));
  };

  return (
    <div className="space-y-8">
      {/* Sélection de plan */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {isActive ? "Votre abonnement" : "Choisissez votre plan"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const previousPlan = index > 0 ? plans[index - 1] : undefined;
            const incrementalFeatures = getIncrementalFeatures(plan, previousPlan);
            const isCurrentPlan = isActive && plan.id === (restaurant.stripePriceId as PlanId);
            return (
            <Card
              key={plan.id}
              className={`relative flex flex-col transition-all ${
                isCurrentPlan
                  ? "border-2 border-emerald-500 shadow-lg shadow-emerald-500/10"
                  : plan.popular
                    ? "border-2 border-primary shadow-lg shadow-primary/10"
                    : "border border-border"
              }`}
            >
              <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1">
                {isCurrentPlan && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 px-2 py-0.5 text-xs font-semibold">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Plan actuel
                  </Badge>
                )}
                {!isCurrentPlan && plan.popular && (
                  <Badge className="bg-primary text-black border-primary px-2 py-0.5 text-xs font-semibold">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {plan.popularLabel ?? "Populaire"}
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="flex flex-col flex-1 gap-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{plan.monthlyPrice}€</span>
                    <span className="text-muted-foreground text-sm">/mois</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">+ {plan.callRate}</p>
                </div>

                <div className="space-y-2 flex-1">
                  {previousPlan && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
                      Tout pareil que {previousPlan.name} +
                    </p>
                  )}

                  {incrementalFeatures.map((feature) => (
                    <div key={`${plan.id}-${feature}`} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={isCurrentPlan ? handleManage : () => handleSubscribe(plan.id as PlanId)}
                  disabled={isPending}
                  className={`w-full mt-auto ${
                    isCurrentPlan
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : plan.popular
                        ? "bg-primary text-black hover:bg-primary/90"
                        : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                  }`}
                >
                  {isCurrentPlan ? (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {isPending ? "Redirection..." : "Gérer mon abonnement"}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      {loadingPlan === plan.id
                        ? "Redirection..."
                        : isActive
                          ? "Changer vers ce plan"
                          : "Choisir ce plan"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Sans engagement · Résiliable à tout moment · Paiement sécurisé via Stripe
      </p>
    </div>
  );
}
