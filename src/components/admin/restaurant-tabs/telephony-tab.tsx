"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Save, Phone, Clock, Code } from "lucide-react";
import { toast } from "sonner";
import { updateRestaurantTelephony } from "@/app/(admin)/admin/restaurants/actions";

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Numéro invalide"),
  twilioPhoneNumber: z.string().max(20).optional(),
  businessHours: z.string().max(5000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Restaurant = {
  id: string;
  phoneNumber: string;
  twilioPhoneNumber: string | null;
  businessHours: string | null;
};

interface TelephonyTabProps {
  restaurant: Restaurant;
}

const defaultBusinessHours = `{
  "timezone": "Europe/Paris",
  "schedule": {
    "monday": { "open": "11:00", "close": "22:00" },
    "tuesday": { "open": "11:00", "close": "22:00" },
    "wednesday": { "open": "11:00", "close": "22:00" },
    "thursday": { "open": "11:00", "close": "22:00" },
    "friday": { "open": "11:00", "close": "23:00" },
    "saturday": { "open": "11:00", "close": "23:00" },
    "sunday": { "open": "11:00", "close": "22:00" }
  }
}`;

export function TelephonyTab({ restaurant }: TelephonyTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingHoursJson, setIsGeneratingHoursJson] = useState(false);
  const [generatedHoursJson, setGeneratedHoursJson] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: restaurant.phoneNumber,
      twilioPhoneNumber: restaurant.twilioPhoneNumber || "",
      businessHours: restaurant.businessHours || "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    
    const result = await updateRestaurantTelephony(restaurant.id, {
      phoneNumber: data.phoneNumber,
      twilioPhoneNumber: data.twilioPhoneNumber || null,
      businessHours: data.businessHours || null,
    });

    if (result.success) {
      toast.success("Configuration téléphonie mise à jour");
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }

    setIsLoading(false);
  }

  const hasTwilioNumber = !!form.watch("twilioPhoneNumber");

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={`border ${hasTwilioNumber ? 'border-emerald-400/20 bg-emerald-400/5' : 'border-amber-400/20 bg-amber-400/5'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${hasTwilioNumber ? 'bg-emerald-400/10' : 'bg-amber-400/10'} flex items-center justify-center`}>
              <Phone className={`w-5 h-5 ${hasTwilioNumber ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>
            <div>
              <p className={`font-medium ${hasTwilioNumber ? 'text-emerald-400' : 'text-amber-400'}`}>
                {hasTwilioNumber ? 'Ligne Twilio Active' : 'Ligne Twilio Non configurée'}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasTwilioNumber 
                  ? `Numéro Twilio : ${form.watch("twilioPhoneNumber")}`
                  : 'Configurez un numéro Twilio pour recevoir les appels via l\'IA'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Numéros de téléphone */}
        <Card className="border-border bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Numéros de téléphone
            </CardTitle>
            <CardDescription>
              Configuration des numéros de téléphone du restaurant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Numéro principal */}
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

            {/* Numéro Twilio */}
            <div className="space-y-2">
              <Label htmlFor="twilioPhoneNumber">Numéro Twilio (IA)</Label>
              <Input
                id="twilioPhoneNumber"
                {...form.register("twilioPhoneNumber")}
                disabled={isLoading}
                placeholder="+33xxxxxxxxx"
                className="bg-background/50 border-border focus:border-primary/50 font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Numéro acheté sur Twilio pour recevoir les appels de l&apos;IA
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Horaires */}
        <Card className="border-border bg-card/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Horaires d&apos;ouverture
                </CardTitle>
                <CardDescription>
                  Configuration des horaires au format JSON (utilisés par l&apos;IA pour informer les clients)
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isGeneratingHoursJson}
                    onClick={async () => {
                      setIsGeneratingHoursJson(true);
                      try {
                        // Génère le JSON des horaires actuels
                        const currentHours = form.watch("businessHours") || defaultBusinessHours;
                        let parsedHours;
                        try {
                          parsedHours = JSON.parse(currentHours);
                        } catch {
                          parsedHours = JSON.parse(defaultBusinessHours);
                        }
                        setGeneratedHoursJson(JSON.stringify(parsedHours, null, 2));
                      } catch (error) {
                        toast.error("Erreur lors de la génération du JSON");
                      } finally {
                        setIsGeneratingHoursJson(false);
                      }
                    }}
                  >
                    {isGeneratingHoursJson ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Code className="w-4 h-4 mr-2" />
                        Générer JSON Horaires
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                {generatedHoursJson && (
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>JSON Horaires Généré</DialogTitle>
                      <DialogDescription>
                        Format JSON des horaires pour vérification technique
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      readOnly
                      value={generatedHoursJson}
                      rows={15}
                      className="font-mono text-sm bg-background/50"
                    />
                  </DialogContent>
                )}
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="businessHours">Horaires (JSON)</Label>
              <Textarea
                id="businessHours"
                {...form.register("businessHours")}
                disabled={isLoading}
                rows={12}
                placeholder={defaultBusinessHours}
                className="bg-background/50 border-border focus:border-primary/50 font-mono text-sm resize-y min-h-[250px]"
              />
              {form.formState.errors.businessHours && (
                <p className="text-sm text-red-400">{form.formState.errors.businessHours.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Format JSON avec les jours de la semaine et les horaires d&apos;ouverture/fermeture
              </p>
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
                Enregistrer la téléphonie
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
