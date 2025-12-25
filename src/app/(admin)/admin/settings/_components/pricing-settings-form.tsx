"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Euro } from "lucide-react";
import { toast } from "sonner";
import { updatePricingConfig } from "../actions";

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
  initialConfig: PricingConfig;
}

export function PricingSettingsForm({ initialConfig }: PricingSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyPrice: initialConfig.monthlyPrice / 100, // Convertir centimes en euros
      setupFee: initialConfig.setupFee / 100,
      includedMinutes: initialConfig.includedMinutes,
      overflowPricePerMinute: initialConfig.overflowPricePerMinute / 100,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    const result = await updatePricingConfig({
      monthlyPrice: Math.round(data.monthlyPrice * 100), // Convertir euros en centimes
      setupFee: Math.round(data.setupFee * 100),
      includedMinutes: data.includedMinutes,
      overflowPricePerMinute: Math.round(data.overflowPricePerMinute * 100),
    });

    if (result.success) {
      toast.success("Configuration des prix mise à jour");
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prix mensuel */}
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

        {/* Frais de mise en service */}
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

        {/* Minutes incluses */}
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

        {/* Prix par minute supplémentaire */}
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

      {/* Actions */}
      <div className="flex justify-end pt-4 border-t border-border">
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
              Enregistrer les modifications
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

