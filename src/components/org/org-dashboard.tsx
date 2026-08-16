"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Utensils,
  ChevronRight,
  Zap,
  ShoppingBag,
  PhoneCall,
} from "lucide-react";
import { switchRestaurant } from "@/features/restaurant/switch-actions";
import { BillingPageContent } from "@/app/(app)/dashboard/billing/_components/billing-page-content";
import { UsageSection } from "@/app/(app)/dashboard/billing/_components/usage-section";
import { SUBSCRIPTION_PLANS } from "@/features/billing/plans";
import type { CallUsage } from "@/features/billing/usage-actions";

type OrgInfo = {
  id: string;
  name: string;
  isActive: boolean;
  stripeSubscriptionStatus: string | null;
  stripeCurrentPeriodEnd: Date | null;
  stripePriceId: string | null;
  billingStartDate: string | null;
  stripeCustomerId: string | null;
};

type RestaurantInfo = {
  id: string;
  name: string;
  status: string;
  vapiAssistantId: string | null;
  phoneNumber: string;
};

type Stats = {
  restaurants: RestaurantInfo[];
  ordersLast30Days: number;
  revenueLast30Days: number;
  totalCalls: number;
};

interface OrgDashboardProps {
  user: { firstName: string | null; email: string };
  org: OrgInfo;
  stats: Stats;
  currentRestaurantId: string | null;
  plans: typeof SUBSCRIPTION_PLANS;
  usage?: CallUsage;
}

const SUB_STATUS: Record<string, { label: string; dot: string; text: string }> = {
  active: { label: "Actif", dot: "bg-emerald-400", text: "text-emerald-400" },
  trialing: { label: "Période d'essai", dot: "bg-amber-400", text: "text-amber-400" },
  past_due: { label: "Paiement en retard", dot: "bg-red-400", text: "text-red-400" },
  canceled: { label: "Annulé", dot: "bg-zinc-500", text: "text-zinc-400" },
};

export function OrgDashboard({ user, org, stats, plans, usage }: Readonly<OrgDashboardProps>) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "billing">("overview");

  const greeting = user.firstName ? user.firstName : user.email.split("@")[0];
  const sub = org.stripeSubscriptionStatus ? SUB_STATUS[org.stripeSubscriptionStatus] : null;

  function handleSelectRestaurant(restaurantId: string) {
    setSelectingId(restaurantId);
    startTransition(async () => {
      await switchRestaurant(restaurantId);
      router.push("/dashboard");
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b border-border/60 bg-card/20 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-semibold text-sm truncate max-w-[200px]">{org.name}</span>
          </div>
          {sub && (
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${sub.dot} shrink-0`} />
              <span className={`text-xs font-medium ${sub.text}`}>{sub.label}</span>
              {org.stripeCurrentPeriodEnd && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  &middot; jusqu&apos;au {new Date(org.stripeCurrentPeriodEnd).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 pt-8 pb-12">
        {}
        <p className="text-muted-foreground mb-7">
          Bonjour, <span className="text-foreground font-medium">{greeting}</span>
        </p>

        {}
        <div className="mb-6 border border-border rounded-xl bg-card/20 p-1 grid grid-cols-2 gap-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
              activeTab === "overview"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            Vue d&apos;ensemble
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
              activeTab === "billing"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            Abonnement
          </button>
        </div>

        {}
        {activeTab === "overview" && (
          <>
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Restaurants
          </h2>
          <div className="border border-border rounded-xl overflow-hidden divide-y divide-border bg-card/20">
            {stats.restaurants.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
                <Utensils className="w-8 h-8 opacity-30" />
                <p className="text-sm">Aucun restaurant dans cette organisation</p>
              </div>
            ) : (
              stats.restaurants.map((restaurant) => {
                const isSelecting = selectingId === restaurant.id;
                const statusDot =
                  restaurant.status === "active"
                    ? "bg-emerald-400"
                    : restaurant.status === "onboarding"
                      ? "bg-amber-400"
                      : "bg-red-400";
                const statusLabel =
                  restaurant.status === "active"
                    ? "Actif"
                    : restaurant.status === "onboarding"
                      ? "Onboarding"
                      : "Suspendu";

                return (
                  <div
                    key={restaurant.id}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-card/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Utensils className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{restaurant.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot} shrink-0`} />
                        <span className="text-xs text-muted-foreground">{statusLabel}</span>
                        {restaurant.phoneNumber && (
                          <>
                            <span className="text-muted-foreground/40 text-xs">·</span>
                            <span className="text-xs text-muted-foreground">{restaurant.phoneNumber}</span>
                          </>
                        )}
                        {restaurant.vapiAssistantId && (
                          <>
                            <span className="text-muted-foreground/40 text-xs">·</span>
                            <Zap className="w-3 h-3 text-sky-400 shrink-0" />
                            <span className="text-xs text-sky-400">IA active</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectRestaurant(restaurant.id)}
                      disabled={!!selectingId}
                      className="shrink-0 h-8 text-xs gap-1"
                    >
                      {isSelecting ? (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      ) : (
                        <>
                          Accéder
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {}
        <div className="border border-border rounded-xl bg-card/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Activité
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Appels IA</span>
              </div>
              <span className="text-xl font-semibold">{stats.totalCalls}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Commandes / 30j</span>
              </div>
              <span className="text-xl font-semibold">{stats.ordersLast30Days}</span>
            </div>
          </div>
        </div>
        </>
        )}

        {}
        {activeTab === "billing" && (
          <div>
            {usage && <UsageSection usage={usage} />}
            <div className="mt-12">
            <BillingPageContent
              restaurant={{
                stripeSubscriptionStatus: org.stripeSubscriptionStatus,
                stripePriceId: org.stripePriceId,
                billingStartDate: org.billingStartDate,
                stripeCustomerId: org.stripeCustomerId,
              }}
              restaurantCount={stats.restaurants.length}
              plans={plans}
              orgId={org.id}
            />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
