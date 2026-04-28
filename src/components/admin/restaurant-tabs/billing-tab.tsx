"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/status-badge";

type Restaurant = {
  id: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  stripePriceId: string | null;
  billingStartDate?: string | null;
};

interface BillingTabProps {
  restaurant: Restaurant;
}

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter (29€/mois)",
  essential: "Essential (149€/mois)",
  infinity: "Infinity (349€/mois)",
};

function getPlanLabel(priceId: string | null): string {
  if (!priceId) return "—";
  return PLAN_LABELS[priceId] ?? priceId;
}

function getStatusBadge(status: string | null) {
  if (!status) return <AdminStatusBadge tone="neutral" label="Non défini" />;

  switch (status) {
    case "active":
      return <AdminStatusBadge tone="active" label="Actif" />;
    case "trialing":
      return <AdminStatusBadge tone="warning" label="Période d'essai" />;
    case "past_due":
      return <AdminStatusBadge tone="warning" label="Paiement en retard" />;
    case "canceled":
    case "cancelled":
      return <AdminStatusBadge tone="danger" label="Annulé" />;
    default:
      return <AdminStatusBadge tone="neutral" label={status} />;
  }
}

export function BillingTab({ restaurant }: Readonly<BillingTabProps>) {
  const formatDateForDisplay = (dateString: string | null | undefined): string => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Abonnement Stripe
          </CardTitle>
          <CardDescription>Informations sur l&apos;abonnement en cours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Plan souscrit
              </p>
              <p className="font-medium">{getPlanLabel(restaurant.stripePriceId)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Statut
              </p>
              {getStatusBadge(restaurant.stripeSubscriptionStatus)}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Depuis le
              </p>
              <p className="font-medium">{formatDateForDisplay(restaurant.billingStartDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/30">
        <CardHeader>
          <CardTitle>ID Client Stripe</CardTitle>
          <CardDescription>
            Identifiant Stripe en lecture seule, synchronisé automatiquement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="stripeCustomerId">Stripe Customer ID</Label>
            <Input
              id="stripeCustomerId"
              value={restaurant.stripeCustomerId || ""}
              readOnly
              disabled
              placeholder="cus_xxxxxxxxxxxx"
              className="bg-muted/50 cursor-not-allowed font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Ce champ ne peut pas être modifié depuis l&apos;admin.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
