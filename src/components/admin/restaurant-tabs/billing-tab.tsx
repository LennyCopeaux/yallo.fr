"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"
                className="text-[#635BFF]"
              />
            </svg>
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
