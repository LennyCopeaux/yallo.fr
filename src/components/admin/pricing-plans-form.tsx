"use client";

import { useState, createContext, useContext, useEffect } from "react";
import type React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, CreditCard, Euro, Percent, Clock, Link2, Star, Type } from "lucide-react";
import { toast } from "sonner";
import { updatePricingPlan, type PricingPlan } from "@/app/(admin)/admin/settings/actions";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PricingPlansFormContextType = {
  plans: PricingPlan[];
  updatePlan: (planName: string, data: PlanFormValues) => Promise<void>;
  isLoading: Record<string, boolean>;
};

const PricingPlansFormContext = createContext<PricingPlansFormContextType | null>(null);

// Helper function to parse nullable number inputs
const parseNullableNumber = (v: string | number | null | undefined): number | undefined => {
  if (v === "" || v === null || v === undefined) return undefined;
  const num = Number(v);
  return Number.isNaN(num) ? undefined : num;
};

const planFormSchema = z.object({
  subtitle: z.string().min(1, "Le sous-titre est requis"),
  target: z.string().min(1, "La description est requise"),
  monthlyPrice: z.number().min(0, "Prix invalide"),
  setupFee: z.number().min(0, "Frais invalides").nullable().optional(),
  commissionRate: z.number().min(0).max(100, "Commission invalide").nullable().optional(),
  includedMinutes: z.number().min(0, "Minutes invalides").nullable().optional(),
  overflowPricePerMinute: z.number().min(0, "Prix invalide").nullable().optional(),
  hubrise: z.boolean(),
  popular: z.boolean(),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

interface PricingPlansFormProps {
  readonly initialPlans: PricingPlan[];
}

function PlanForm({ plan }: { plan: PricingPlan }) {
  const context = useContext(PricingPlansFormContext);
  if (!context) return null;

  const { updatePlan, isLoading } = context;
  const [isDirty, setIsDirty] = useState(false);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      subtitle: plan.subtitle,
      target: plan.target,
      monthlyPrice: plan.monthlyPrice / 100,
      setupFee: plan.setupFee !== null ? plan.setupFee / 100 : undefined,
      commissionRate: plan.commissionRate !== null ? plan.commissionRate : undefined,
      includedMinutes: plan.includedMinutes !== null ? plan.includedMinutes : undefined,
      overflowPricePerMinute: plan.overflowPricePerMinute !== null ? plan.overflowPricePerMinute / 100 : undefined,
      hubrise: plan.hubrise,
      popular: plan.popular,
    },
  });

  const planIsLoading = isLoading[plan.name] || false;
  const watchedValues = form.watch();

  const handleSubmit = async (data: PlanFormValues) => {
    await updatePlan(plan.name, data);
    setIsDirty(false);
    form.reset(data);
  };

  // Détecter les changements
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name) {
        setIsDirty(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Card className={cn(
      "border-border bg-card/30 transition-all",
      plan.popular && "border-primary/50 shadow-lg shadow-primary/5"
    )}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">
                {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
              </CardTitle>
            </div>
            <CardDescription className="text-sm mt-1">
              Identifiant: <span className="font-mono text-xs">{plan.name}</span>
            </CardDescription>
          </div>
          {plan.popular && (
            <span className="px-3 py-1 text-xs font-semibold bg-primary text-black rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" />
              Populaire
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          {/* Section Informations générales */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Informations générales</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${plan.name}-subtitle`}>
                  Sous-titre
                </Label>
                <Input
                  id={`${plan.name}-subtitle`}
                  {...form.register("subtitle")}
                  disabled={planIsLoading}
                  placeholder="Ex: Test, Standard, Volume"
                  className="bg-background/50 border-border focus:border-primary/50"
                />
                {form.formState.errors.subtitle && (
                  <p className="text-sm text-red-400">{form.formState.errors.subtitle.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Court texte affiché sous le nom de l'offre
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${plan.name}-target`}>
                  Description cible
                </Label>
                <Textarea
                  id={`${plan.name}-target`}
                  {...form.register("target")}
                  disabled={planIsLoading}
                  placeholder="Ex: Pour tester l'IA sans risque"
                  className="bg-background/50 border-border focus:border-primary/50 min-h-[80px] resize-none"
                />
                {form.formState.errors.target && (
                  <p className="text-sm text-red-400">{form.formState.errors.target.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Description de l'offre pour le public cible
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border my-6" />

          {/* Section Tarification */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Euro className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Tarification</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${plan.name}-monthlyPrice`} className="flex items-center gap-2">
                  <Euro className="w-4 h-4" />
                  Prix mensuel (€)
                </Label>
                <Input
                  id={`${plan.name}-monthlyPrice`}
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register("monthlyPrice", { valueAsNumber: true })}
                  disabled={planIsLoading}
                  className="bg-background/50 border-border focus:border-primary/50"
                />
                {form.formState.errors.monthlyPrice && (
                  <p className="text-sm text-red-400">{form.formState.errors.monthlyPrice.message}</p>
                )}
              </div>

              {plan.name === "starter" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`${plan.name}-setupFee`} className="flex items-center gap-2">
                      <Euro className="w-4 h-4" />
                      Frais de mise en service (€)
                    </Label>
                    <Input
                      id={`${plan.name}-setupFee`}
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register("setupFee", { 
                        valueAsNumber: true,
                        setValueAs: parseNullableNumber
                      })}
                      disabled={planIsLoading}
                      className="bg-background/50 border-border focus:border-primary/50"
                      placeholder="Laissez vide si aucun frais"
                    />
                    {form.formState.errors.setupFee && (
                      <p className="text-sm text-red-400">{form.formState.errors.setupFee.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Laissez vide pour ne pas afficher de frais
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${plan.name}-commissionRate`} className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Commission (%)
                    </Label>
                    <Input
                      id={`${plan.name}-commissionRate`}
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      {...form.register("commissionRate", { 
                        valueAsNumber: true,
                        setValueAs: parseNullableNumber
                      })}
                      disabled={planIsLoading}
                      className="bg-background/50 border-border focus:border-primary/50"
                      placeholder="Laissez vide pour 0%"
                    />
                    {form.formState.errors.commissionRate && (
                      <p className="text-sm text-red-400">{form.formState.errors.commissionRate.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Pourcentage de commission sur chaque commande
                    </p>
                  </div>
                </>
              )}

              {plan.name !== "starter" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`${plan.name}-includedMinutes`} className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Minutes incluses
                    </Label>
                    <Input
                      id={`${plan.name}-includedMinutes`}
                      type="number"
                      min="0"
                      {...form.register("includedMinutes", { 
                        valueAsNumber: true,
                        setValueAs: parseNullableNumber
                      })}
                      disabled={planIsLoading}
                      className="bg-background/50 border-border focus:border-primary/50"
                      placeholder="Ex: 400, 1200"
                    />
                    {form.formState.errors.includedMinutes && (
                      <p className="text-sm text-red-400">{form.formState.errors.includedMinutes.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Nombre de minutes incluses dans le forfait mensuel
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${plan.name}-overflowPricePerMinute`} className="flex items-center gap-2">
                      <Euro className="w-4 h-4" />
                      Coût par minute supplémentaire (€)
                    </Label>
                    <Input
                      id={`${plan.name}-overflowPricePerMinute`}
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register("overflowPricePerMinute", { 
                        valueAsNumber: true,
                        setValueAs: parseNullableNumber
                      })}
                      disabled={planIsLoading}
                      className="bg-background/50 border-border focus:border-primary/50"
                      placeholder="Ex: 0.25, 0.20"
                    />
                    {form.formState.errors.overflowPricePerMinute && (
                      <p className="text-sm text-red-400">{form.formState.errors.overflowPricePerMinute.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Prix facturé par minute au-delà du forfait
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-border my-6" />

          {/* Section Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Options d'affichage</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/30">
                <div className="space-y-0.5">
                  <Label htmlFor={`${plan.name}-hubrise`} className="flex items-center gap-2 cursor-pointer">
                    <Link2 className="w-4 h-4 text-muted-foreground" />
                    Connexion HubRise
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Afficher l'icône HubRise sur cette offre
                  </p>
                </div>
                <Switch
                  id={`${plan.name}-hubrise`}
                  checked={watchedValues.hubrise}
                  onCheckedChange={(checked) => {
                    form.setValue("hubrise", checked);
                    setIsDirty(true);
                  }}
                  disabled={planIsLoading}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/30">
                <div className="space-y-0.5">
                  <Label htmlFor={`${plan.name}-popular`} className="flex items-center gap-2 cursor-pointer">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    Badge "Populaire"
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Mettre en avant cette offre avec un badge
                  </p>
                </div>
                <Switch
                  id={`${plan.name}-popular`}
                  checked={watchedValues.popular}
                  onCheckedChange={(checked) => {
                    form.setValue("popular", checked);
                    setIsDirty(true);
                  }}
                  disabled={planIsLoading}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border my-6" />

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={planIsLoading || !isDirty}
              className={cn(
                "bg-primary text-black hover:bg-primary/90 min-w-[140px]",
                !isDirty && "opacity-50 cursor-not-allowed"
              )}
            >
              {planIsLoading ? (
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
        </form>
      </CardContent>
    </Card>
  );
}

export function PricingPlansForm({ initialPlans }: PricingPlansFormProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const updatePlan = async (planName: string, data: PlanFormValues) => {
    setIsLoading((prev) => ({ ...prev, [planName]: true }));

    const convertToCents = (value: number | undefined | null): number | null => {
      if (value === undefined || value === null) return null;
      return Math.round(value * 100);
    };

    const updatedPlanData = {
      name: planName as "starter" | "essential" | "infinity",
      subtitle: data.subtitle,
      target: data.target,
      monthlyPrice: Math.round(data.monthlyPrice * 100),
      setupFee: convertToCents(data.setupFee),
      commissionRate: data.commissionRate ?? null,
      includedMinutes: data.includedMinutes ?? null,
      overflowPricePerMinute: convertToCents(data.overflowPricePerMinute),
      hubrise: data.hubrise,
      popular: data.popular,
    };

    const result = await updatePricingPlan(updatedPlanData);

    if (result.success) {
      toast.success(`Offre ${planName} mise à jour avec succès`);
      setPlans((prev) =>
        prev.map((p) =>
          p.name === planName
            ? {
                ...p,
                ...updatedPlanData,
              }
            : p
        )
      );
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }

    setIsLoading((prev) => ({ ...prev, [planName]: false }));
  };

  return (
    <PricingPlansFormContext.Provider value={{ plans, updatePlan, isLoading }}>
      <div className="space-y-6">
        {plans.map((plan) => (
          <PlanForm key={plan.id} plan={plan} />
        ))}
      </div>
    </PricingPlansFormContext.Provider>
  );
}
