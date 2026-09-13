"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateOrganizationBilling } from "@/app/(admin)/admin/actions";
import type { OrgDetail } from "@/components/admin/org-detail-tabs";

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function statusVariant(status: string | null): "default" | "secondary" | "destructive" {
  if (status === "active") return "default";
  if (status === "trialing") return "secondary";
  return "destructive";
}

interface OrgBillingTabProps {
  org: OrgDetail;
}

export function OrgBillingTab({ org }: Readonly<OrgBillingTabProps>) {
  const [, startTransition] = useTransition();
  const [stripeCustomerId, setStripeCustomerId] = useState(org.stripeCustomerId ?? "");
  const [billingStartDate, setBillingStartDate] = useState(org.billingStartDate ?? "");
  const [manualAccessEnabled, setManualAccessEnabled] = useState(org.manualAccessEnabled);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    stripeCustomerId !== (org.stripeCustomerId ?? "") ||
    billingStartDate !== (org.billingStartDate ?? "") ||
    manualAccessEnabled !== org.manualAccessEnabled;

  function handleSave() {
    setIsSaving(true);
    startTransition(async () => {
      const result = await updateOrganizationBilling(org.id, {
        stripeCustomerId,
        billingStartDate,
        manualAccessEnabled,
      });
      setIsSaving(false);
      if (result.success) toast.success("Facturation mise à jour");
      else toast.error(result.error ?? "Erreur");
    });
  }

  return (
    <div className="space-y-6">
      {}
      <Card className="border-border bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                fill="#635BFF"
                d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"
              />
            </svg>
            Abonnement Stripe
          </CardTitle>
          <CardDescription>Données synchronisées depuis Stripe via webhooks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-background/40 border border-border/50 space-y-1">
              <p className="text-xs text-muted-foreground">Statut</p>
              {org.stripeSubscriptionStatus ? (
                <Badge variant={statusVariant(org.stripeSubscriptionStatus)} className="capitalize">
                  {org.stripeSubscriptionStatus}
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </div>
            <div className="p-4 rounded-lg bg-background/40 border border-border/50 space-y-1">
              <p className="text-xs text-muted-foreground">Fin de période</p>
              <p className="text-sm font-medium">{formatDate(org.stripeCurrentPeriodEnd)}</p>
            </div>
            <div className="p-4 rounded-lg bg-background/40 border border-border/50 space-y-1">
              <p className="text-xs text-muted-foreground">Subscription ID</p>
              <p className="text-sm font-mono truncate">
                {org.stripeSubscriptionId ?? <span className="text-muted-foreground">—</span>}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background/40 border border-border/50 space-y-1">
              <p className="text-xs text-muted-foreground">Price ID</p>
              <p className="text-sm font-mono truncate">
                {org.stripePriceId ?? <span className="text-muted-foreground">—</span>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card className="border-border bg-card/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configuration manuelle</CardTitle>
              <CardDescription className="mt-1">Identifiants Stripe à renseigner manuellement</CardDescription>
            </div>
            {hasChanges && (
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stripe-customer-id">Stripe Customer ID</Label>
            <Input
              id="stripe-customer-id"
              value={stripeCustomerId}
              onChange={(e) => setStripeCustomerId(e.target.value)}
              placeholder="cus_XXXXXXXXXXXXXXXXXX"
              className="bg-background/50 border-border font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing-start">Date de début de facturation</Label>
            <Input
              id="billing-start"
              type="date"
              value={billingStartDate}
              onChange={(e) => setBillingStartDate(e.target.value)}
              className="bg-background/50 border-border"
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-background/40 p-4">
            <div className="space-y-1">
              <Label htmlFor="manual-access" className="cursor-pointer">
                Accès offert (sans abonnement Stripe)
              </Label>
              <p className="text-xs text-muted-foreground">
                Débloque le dashboard et l&apos;assistant vocal sans paiement : comptes
                internes, pilotes et partenaires.
              </p>
            </div>
            <Switch
              id="manual-access"
              checked={manualAccessEnabled}
              onCheckedChange={setManualAccessEnabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
