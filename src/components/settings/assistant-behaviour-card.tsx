"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Zap, Save, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { updateAssistantBehaviour } from "@/features/settings/actions";
import type { AssistantSettings } from "@/features/settings/actions";

interface AssistantBehaviourCardProps {
  initialData: AssistantSettings;
}

export function AssistantBehaviourCard({ initialData }: AssistantBehaviourCardProps) {
  const [upsellEnabled, setUpsellEnabled] = useState(initialData.upsellEnabled);
  const [smsConfirmationEnabled, setSmsConfirmationEnabled] = useState(
    initialData.smsConfirmationEnabled
  );
  const [autoRushEnabled, setAutoRushEnabled] = useState(
    initialData.autoRushThreshold !== null
  );
  const [autoRushThreshold, setAutoRushThreshold] = useState(
    String(initialData.autoRushThreshold ?? 10)
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDirty =
    upsellEnabled !== initialData.upsellEnabled ||
    smsConfirmationEnabled !== initialData.smsConfirmationEnabled ||
    (autoRushEnabled ? Number(autoRushThreshold) : null) !== initialData.autoRushThreshold;

  function handleSave() {
    const threshold = autoRushEnabled ? parseInt(autoRushThreshold, 10) : null;
    if (autoRushEnabled && (!threshold || threshold < 1)) {
      setErrorMessage("Le seuil RUSH doit être un nombre entier positif.");
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await updateAssistantBehaviour({
        upsellEnabled,
        smsConfirmationEnabled,
        autoRushThreshold: threshold,
      });

      if (result.success) {
        setSuccessMessage("Paramètres sauvegardés.");
      } else {
        setErrorMessage(result.error ?? "Une erreur est survenue.");
      }
    });
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Automatisations &amp; Notifications</CardTitle>
            <CardDescription className="mt-1">
              Configurez les automatisations et les notifications de votre assistant vocal.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Upsell automatique */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              <Label className="text-sm font-medium cursor-pointer" htmlFor="upsell-toggle">
                Propositions automatiques (upsell)
              </Label>
              <p className="text-xs text-muted-foreground">
                L&apos;IA suggère un complément en fin de commande (boisson, dessert, supplément…)
              </p>
            </div>
          </div>
          <Switch
            id="upsell-toggle"
            checked={upsellEnabled}
            onCheckedChange={(val) => {
              setUpsellEnabled(val);
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            disabled={isPending}
          />
        </div>

        {/* SMS de confirmation */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              <Label className="text-sm font-medium cursor-pointer" htmlFor="sms-toggle">
                SMS de confirmation client
              </Label>
              <p className="text-xs text-muted-foreground">
                Envoie un SMS de confirmation au client après chaque commande enregistrée
              </p>
            </div>
          </div>
          <Switch
            id="sms-toggle"
            checked={smsConfirmationEnabled}
            onCheckedChange={(val) => {
              setSmsConfirmationEnabled(val);
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            disabled={isPending}
          />
        </div>

        {/* Passage auto RUSH */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <Label className="text-sm font-medium cursor-pointer" htmlFor="auto-rush-toggle">
                  Passage automatique en mode RUSH
                </Label>
                <p className="text-xs text-muted-foreground">
                  Bascule automatiquement en mode RUSH quand trop de commandes sont en attente
                </p>
              </div>
            </div>
            <Switch
              id="auto-rush-toggle"
              checked={autoRushEnabled}
              onCheckedChange={(val) => {
                setAutoRushEnabled(val);
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              disabled={isPending}
            />
          </div>

          {autoRushEnabled && (
            <div className="flex items-center gap-3 pl-8">
              <Label htmlFor="auto-rush-threshold" className="text-sm text-muted-foreground whitespace-nowrap">
                Seuil de déclenchement :
              </Label>
              <Input
                id="auto-rush-threshold"
                type="number"
                min={1}
                max={99}
                value={autoRushThreshold}
                onChange={(e) => {
                  setAutoRushThreshold(e.target.value);
                  setSuccessMessage(null);
                  setErrorMessage(null);
                }}
                className="w-24"
                disabled={isPending}
              />
              <span className="text-sm text-muted-foreground">commandes en attente</span>
            </div>
          )}
        </div>

        {successMessage && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {errorMessage}
          </div>
        )}

        <Button onClick={handleSave} disabled={!isDirty || isPending} className="gap-2">
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sauvegarde…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Sauvegarder
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
