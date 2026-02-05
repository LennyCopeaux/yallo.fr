"use client";

import { useState, createContext, useContext } from "react";
import type React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Euro, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { updatePricingConfig } from "@/app/(admin)/admin/settings/actions";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PricingFormContextType = {
  form: ReturnType<typeof useForm<FormValues>>;
  isLoading: boolean;
  isDirty: boolean;
  onSubmit: (data: FormValues) => Promise<void>;
};

const PricingFormContext = createContext<PricingFormContextType | null>(null);

const formSchema = z.object({
  monthlyPrice: z.number().min(0, "Prix invalide"),
  setupFee: z.number().min(0, "Frais invalides"),
  includedMinutes: z.number().min(0, "Minutes invalides"),
  overflowPricePerMinute: z.number().min(0, "Prix invalide"),
});

type FormValues = z.infer<typeof formSchema>;

type PricingConfig = {
  id: string;
  monthlyPrice: number;
  setupFee: number;
  includedMinutes: number;
  overflowPricePerMinute: number;
};

interface PricingSettingsFormProps {
  readonly initialConfig: PricingConfig;
}

function PricingSettingsFormContent() {
  const context = useContext(PricingFormContext);
  if (!context) return null;
  
  const { form, isLoading } = context;

  return (
    <form onSubmit={form.handleSubmit(context.onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="monthlyPrice" className="flex items-center gap-2">
            <Euro className="w-4 h-4" />
            Prix mensuel (€)
          </Label>
          <Input
            id="monthlyPrice"
            type="number"
            step="0.01"
            min="0"
            {...form.register("monthlyPrice", { valueAsNumber: true })}
            disabled={isLoading}
            className="bg-background/50 border-border focus:border-primary/50"
          />
          {form.formState.errors.monthlyPrice && (
            <p className="text-sm text-red-400">{form.formState.errors.monthlyPrice.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Prix de l&apos;abonnement mensuel Yallo Infinity
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="setupFee" className="flex items-center gap-2">
            <Euro className="w-4 h-4" />
            Frais de mise en service (€)
          </Label>
          <Input
            id="setupFee"
            type="number"
            step="0.01"
            min="0"
            {...form.register("setupFee", { valueAsNumber: true })}
            disabled={isLoading}
            className="bg-background/50 border-border focus:border-primary/50"
          />
          {form.formState.errors.setupFee && (
            <p className="text-sm text-red-400">{form.formState.errors.setupFee.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Frais uniques à l&apos;installation
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="includedMinutes">Minutes incluses</Label>
          <Input
            id="includedMinutes"
            type="number"
            min="0"
            {...form.register("includedMinutes", { valueAsNumber: true })}
            disabled={isLoading}
            className="bg-background/50 border-border focus:border-primary/50"
          />
          {form.formState.errors.includedMinutes && (
            <p className="text-sm text-red-400">{form.formState.errors.includedMinutes.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Nombre de minutes d&apos;appels incluses dans le forfait
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="overflowPricePerMinute" className="flex items-center gap-2">
            <Euro className="w-4 h-4" />
            Prix par minute supplémentaire (€)
          </Label>
          <Input
            id="overflowPricePerMinute"
            type="number"
            step="0.01"
            min="0"
            {...form.register("overflowPricePerMinute", { valueAsNumber: true })}
            disabled={isLoading}
            className="bg-background/50 border-border focus:border-primary/50"
          />
          {form.formState.errors.overflowPricePerMinute && (
            <p className="text-sm text-red-400">{form.formState.errors.overflowPricePerMinute.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Prix facturé par minute au-delà du forfait
          </p>
        </div>
      </div>
    </form>
  );
}

export function PricingSettingsForm({ initialConfig }: PricingSettingsFormProps) {
  return (
    <PricingSettingsFormWrapper initialConfig={initialConfig}>
      <PricingSettingsFormContent />
    </PricingSettingsFormWrapper>
  );
}

export function PricingSettingsFormWrapper({ 
  initialConfig, 
  children 
}: PricingSettingsFormProps & { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyPrice: initialConfig.monthlyPrice / 100,
      setupFee: initialConfig.setupFee / 100,
      includedMinutes: initialConfig.includedMinutes,
      overflowPricePerMinute: initialConfig.overflowPricePerMinute / 100,
    },
  });

  const isDirty = form.formState.isDirty;

  async function onSubmit(formValues: FormValues) {
    setIsLoading(true);

    const result = await updatePricingConfig({
      monthlyPrice: Math.round(formValues.monthlyPrice * 100),
      setupFee: Math.round(formValues.setupFee * 100),
      includedMinutes: formValues.includedMinutes,
      overflowPricePerMinute: Math.round(formValues.overflowPricePerMinute * 100),
    });

    if (result.success) {
      toast.success("Configuration des prix mise à jour");
      form.reset(formValues);
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }

    setIsLoading(false);
  }

  return (
    <PricingFormContext.Provider value={{ form, isLoading, isDirty, onSubmit }}>
      {children}
    </PricingFormContext.Provider>
  );
}

export function PricingSettingsFormWrapperWithCard({ initialConfig }: PricingSettingsFormProps) {
  return (
    <PricingSettingsFormWrapper initialConfig={initialConfig}>
      <Card className="border-border bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Configuration des Prix
          </CardTitle>
          <CardDescription>
            Gérez les prix de l&apos;offre Yallo Infinity. Les modifications sont immédiatement visibles sur la page marketing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PricingSettingsFormContent />
        </CardContent>
      </Card>
      
      <PricingSettingsFormButton />
    </PricingSettingsFormWrapper>
  );
}

export function PricingSettingsFormButton() {
  const context = useContext(PricingFormContext);
  if (!context) return null;
  
  const { form, isLoading, isDirty, onSubmit } = context;
  
  return (
    <div className="flex justify-end mt-6">
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
  );
}
