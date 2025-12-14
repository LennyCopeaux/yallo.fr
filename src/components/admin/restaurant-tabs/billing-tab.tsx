"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, CreditCard, Percent, Building, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { updateRestaurantBilling } from "@/app/(admin)/admin/restaurants/actions";

const formSchema = z.object({
  plan: z.enum(["fixed", "commission"]),
  commissionRate: z.number().min(0).max(100).optional(),
  stripeCustomerId: z.string().max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Restaurant = {
  id: string;
  plan: "fixed" | "commission" | null;
  commissionRate: number | null;
  stripeCustomerId: string | null;
};

interface BillingTabProps {
  restaurant: Restaurant;
}

export function BillingTab({ restaurant }: BillingTabProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plan: restaurant.plan || "commission",
      commissionRate: restaurant.commissionRate ?? 5,
      stripeCustomerId: restaurant.stripeCustomerId || "",
    },
  });

  const selectedPlan = form.watch("plan");

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    
    const result = await updateRestaurantBilling(restaurant.id, {
      plan: data.plan,
      commissionRate: data.plan === "commission" ? data.commissionRate : null,
      stripeCustomerId: data.stripeCustomerId || null,
    });

    if (result.success) {
      toast.success("Configuration facturation mise à jour");
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }

    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card className={`border ${selectedPlan === 'fixed' ? 'border-blue-400/20 bg-blue-400/5' : 'border-purple-400/20 bg-purple-400/5'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${selectedPlan === 'fixed' ? 'bg-blue-400/10' : 'bg-purple-400/10'} flex items-center justify-center`}>
              {selectedPlan === "fixed" ? (
                <Building className="w-5 h-5 text-blue-400" />
              ) : (
                <Percent className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <div>
              <p className={`font-medium ${selectedPlan === 'fixed' ? 'text-blue-400' : 'text-purple-400'}`}>
                Plan {selectedPlan === "fixed" ? "Fixe" : "Commission"}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedPlan === "fixed" 
                  ? 'Abonnement mensuel fixe'
                  : `Commission de ${form.watch("commissionRate") || 5}% par commande`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Plan de facturation */}
        <Card className="border-border bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Plan de facturation
            </CardTitle>
            <CardDescription>
              Choisissez le modèle de facturation pour ce restaurant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan */}
            <div className="space-y-2">
              <Label htmlFor="plan">Type de plan *</Label>
              <Select
                value={form.watch("plan")}
                onValueChange={(value: "fixed" | "commission") => form.setValue("plan", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-background/50 border-border focus:border-primary/50">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-400" />
                      <div>
                        <span className="font-medium">Fixe</span>
                        <span className="text-muted-foreground ml-2">— Abonnement mensuel</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="commission">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-purple-400" />
                      <div>
                        <span className="font-medium">Commission</span>
                        <span className="text-muted-foreground ml-2">— % par commande</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Commission Rate - visible seulement si plan = commission */}
            {selectedPlan === "commission" && (
              <div className="space-y-2">
                <Label htmlFor="commissionRate">Taux de commission (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="commissionRate"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    {...form.register("commissionRate", { valueAsNumber: true })}
                    disabled={isLoading}
                    className="bg-background/50 border-border focus:border-primary/50 w-24"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
                {form.formState.errors.commissionRate && (
                  <p className="text-sm text-red-400">{form.formState.errors.commissionRate.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Pourcentage prélevé sur chaque commande passée via l&apos;IA
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stripe */}
        <Card className="border-border bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" className="text-[#635BFF]"/>
              </svg>
              Intégration Stripe
            </CardTitle>
            <CardDescription>
              Identifiant du client Stripe pour la facturation automatique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Alert */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#635BFF]/5 border border-[#635BFF]/10">
                <AlertCircle className="w-5 h-5 text-[#635BFF] shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-[#635BFF] font-medium">Connexion Stripe</p>
                  <p className="text-muted-foreground mt-1">
                    L&apos;ID client Stripe est utilisé pour facturer automatiquement les abonnements ou les commissions.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripeCustomerId">ID Client Stripe</Label>
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
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="border-border bg-card/30">
          <CardHeader>
            <CardTitle>Résumé facturation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Type de plan</span>
                <span className="font-medium">
                  {selectedPlan === "fixed" ? "Abonnement Fixe" : "Commission"}
                </span>
              </div>
              {selectedPlan === "commission" && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Taux de commission</span>
                  <span className="font-medium">{form.watch("commissionRate") || 5}%</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Client Stripe</span>
                <span className={`font-mono text-sm ${form.watch("stripeCustomerId") ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  {form.watch("stripeCustomerId") || "Non configuré"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-black hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer la facturation
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
