"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Phone } from "lucide-react";
import { toast } from "sonner";
import { updateRestaurantTelephony } from "@/app/(admin)/admin/restaurants/actions";
import { cn, normalizeFrenchPhoneNumber } from "@/lib/utils";
import { AdminStatusBadge } from "@/components/admin/status-badge";

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Numéro invalide"),
  twilioPhoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return normalizeFrenchPhoneNumber(val) !== null;
      },
      {
        message:
          "Format invalide. Utilisez le format +33XXXXXXXXX (ex: +33939035299) ou 0XXXXXXXXX (ex: 0939035299)",
      }
    ),
});

type FormValues = z.infer<typeof formSchema>;

type Restaurant = {
  id: string;
  phoneNumber: string;
  twilioPhoneNumber: string | null;
};

interface TelephonyTabProps {
  readonly restaurant: Restaurant;
}

export function TelephonyTab({ restaurant }: TelephonyTabProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: restaurant.phoneNumber,
      twilioPhoneNumber: restaurant.twilioPhoneNumber || "",
    },
  });

  const twilioPhoneNumberValue = useWatch({ control: form.control, name: "twilioPhoneNumber" });

  const isDirty = form.formState.isDirty;

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    // Normalise le numéro Twilio au format E.164 avant l'envoi
    const normalizedTwilioNumber = data.twilioPhoneNumber
      ? normalizeFrenchPhoneNumber(data.twilioPhoneNumber) || data.twilioPhoneNumber
      : null;

    const result = await updateRestaurantTelephony(restaurant.id, {
      phoneNumber: data.phoneNumber,
      twilioPhoneNumber: normalizedTwilioNumber,
    });

    if (result.success) {
      toast.success("Configuration téléphonie mise à jour");
      form.reset(data); // Reset form state après succès
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }

    setIsLoading(false);
  }

  const hasTwilioNumber = Boolean(twilioPhoneNumberValue?.trim());

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card/30">
        <CardHeader>
          <CardTitle>État de la ligne Twilio</CardTitle>
          <CardDescription>
            Statut de disponibilité de la ligne téléphonique liée à l&apos;IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Statut
              </p>
              {hasTwilioNumber ? (
                <AdminStatusBadge tone="active" label="Actif" />
              ) : (
                <AdminStatusBadge tone="warning" label="Non configuré" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Numéro Twilio
              </p>
              <p className="font-medium">{twilioPhoneNumberValue?.trim() || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Numéros de téléphone
            </CardTitle>
            <CardDescription>Configuration des numéros de téléphone du restaurant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Numéro principal du restaurant *</Label>
              <Input
                id="phoneNumber"
                {...form.register("phoneNumber")}
                disabled={isLoading}
                placeholder="+33612345678"
                className="bg-background/50 border-border focus:border-primary/50 font-mono"
              />
              {form.formState.errors.phoneNumber && (
                <p className="text-sm text-red-400">{form.formState.errors.phoneNumber.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Numéro de contact principal affiché aux clients
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twilioPhoneNumber">Numéro Twilio (IA) *</Label>
              <Input
                id="twilioPhoneNumber"
                {...form.register("twilioPhoneNumber")}
                disabled={isLoading}
                placeholder="0939035299 ou +33939035299"
                className="bg-background/50 border-border focus:border-primary/50 font-mono"
              />
              {form.formState.errors.twilioPhoneNumber && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.twilioPhoneNumber.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Numéro acheté sur Twilio pour recevoir les appels de l&apos;IA. Format accepté :
                0939035299 ou +33939035299 (sera automatiquement converti en +33XXXXXXXXX)
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pb-6">
          <Button
            type="submit"
            disabled={isLoading || !isDirty}
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
      </form>
    </div>
  );
}
