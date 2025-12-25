"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, CreditCard, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { updateRestaurantBilling } from "@/app/(admin)/admin/restaurants/actions";

const formSchema = z.object({
  stripeCustomerId: z.string().max(100).optional(),
  billingStartDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Restaurant = {
  id: string;
  stripeCustomerId: string | null;
  billingStartDate?: string | null;
};

interface BillingTabProps {
  restaurant: Restaurant;
}

export function BillingTab({ restaurant }: BillingTabProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Formate la date pour l'input date (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stripeCustomerId: restaurant.stripeCustomerId || "",
      billingStartDate: formatDateForInput(restaurant.billingStartDate),
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    
    const result = await updateRestaurantBilling(restaurant.id, {
      stripeCustomerId: data.stripeCustomerId || null,
      billingStartDate: data.billingStartDate || null,
    });

    if (result.success) {
      toast.success("Configuration facturation mise à jour");
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Date de début de facturation */}
        <Card className="border-border bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Date de début de facturation
            </CardTitle>
            <CardDescription>
              Définissez à partir de quelle date le client commencera à être facturé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="billingStartDate">Date de début *</Label>
              <Input
                id="billingStartDate"
                type="date"
                {...form.register("billingStartDate")}
                disabled={isLoading}
                className="bg-background/50 border-border focus:border-primary/50"
              />
              {form.formState.errors.billingStartDate && (
                <p className="text-sm text-red-400">{form.formState.errors.billingStartDate.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Exemple : Le client commencera à payer à compter du 1er janvier 2025
              </p>
            </div>
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
                    L&apos;ID client Stripe est utilisé pour facturer automatiquement l&apos;abonnement Yallo Infinity.
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
  );
}
