"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { updateRestaurantBilling } from "@/app/(admin)/admin/restaurants/actions";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  stripeCustomerId: z.string().max(100).optional(),
  billingStartDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
  if (!status) return <span className="text-muted-foreground text-sm">—</span>;
  switch (status) {
    case "active":
      return (
        <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          <CheckCircle className="w-3 h-3" />
          Actif
        </Badge>
      );
    case "trialing":
      return (
        <Badge className="gap-1.5 bg-blue-500/10 text-blue-500 border-blue-500/20">
          <Clock className="w-3 h-3" />
          Période d&apos;essai
        </Badge>
      );
    case "past_due":
      return (
        <Badge className="gap-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20">
          <XCircle className="w-3 h-3" />
          Paiement en retard
        </Badge>
      );
    case "canceled":
    case "cancelled":
      return (
        <Badge className="gap-1.5 bg-red-500/10 text-red-500 border-red-500/20">
          <XCircle className="w-3 h-3" />
          Annulé
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function BillingTab({ restaurant }: Readonly<BillingTabProps>) {
  const [isLoading, setIsLoading] = useState(false);

  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stripeCustomerId: restaurant.stripeCustomerId || "",
      billingStartDate: formatDateForInput(restaurant.billingStartDate),
    },
  });

  const isDirty = form.formState.isDirty;

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    
    const result = await updateRestaurantBilling(restaurant.id, {
      stripeCustomerId: data.stripeCustomerId || null,
      billingStartDate: data.billingStartDate || null,
    });

    if (result.success) {
      toast.success("Configuration facturation mise à jour");
      form.reset(data);
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }

    setIsLoading(false);
  }

  return (
    <>
      {/* Résumé abonnement (lecture seule) */}
      <Card className="border-border bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" className="text-[#635BFF]"/>
            </svg>
            Abonnement Stripe
          </CardTitle>
          <CardDescription>Informations sur l&apos;abonnement en cours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Plan souscrit</p>
              <p className="font-medium">{getPlanLabel(restaurant.stripePriceId)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Statut</p>
              {getStatusBadge(restaurant.stripeSubscriptionStatus)}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Depuis le</p>
              <p className="font-medium">{formatDateForDisplay(restaurant.billingStartDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
        <Card className="border-border bg-card/30">
          <CardHeader>
            <CardTitle>ID Client Stripe</CardTitle>
            <CardDescription>
              Identifiant Stripe du client pour la facturation automatique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="stripeCustomerId">Stripe Customer ID</Label>
              <Input
                id="stripeCustomerId"
                {...form.register("stripeCustomerId")}
                disabled={isLoading}
                placeholder="cus_xxxxxxxxxxxx"
                className="bg-background/50 border-border focus:border-primary/50 font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Format : cus_xxxxxxxxxxxxxx (depuis le dashboard Stripe)
              </p>
            </div>
          </CardContent>
        </Card>
      </form>
      
      <div className="flex justify-end mt-6 pb-6">
        <Button
          type="button"
          disabled={isLoading || !isDirty}
          onClick={form.handleSubmit(onSubmit)}
          className={cn(
            "bg-primary text-black hover:bg-primary/90",
            !isDirty && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </>
  );
}
