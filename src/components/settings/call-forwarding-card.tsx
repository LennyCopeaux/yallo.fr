"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhoneForwarded, Phone, Save, CheckCircle2, XCircle, Loader2, Info } from "lucide-react";
import { updateCallForwardingSettings } from "@/features/settings/actions";
import type { CallForwardingSettings } from "@/features/settings/actions";

interface CallForwardingCardProps {
  initialData: CallForwardingSettings;
}

export function CallForwardingCard({ initialData }: CallForwardingCardProps) {
  const [forwardingEnabled, setForwardingEnabled] = useState(
    initialData.callForwardingEnabled
  );
  const [forwardingNumber, setForwardingNumber] = useState(
    initialData.restaurantPhoneNumber
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDirty =
    forwardingEnabled !== initialData.callForwardingEnabled ||
    forwardingNumber !== initialData.restaurantPhoneNumber;

  function handleSave() {
    setSuccessMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await updateCallForwardingSettings({
        callForwardingEnabled: forwardingEnabled,
        restaurantPhoneNumber: forwardingNumber,
      });

      if (result.success) {
        setSuccessMessage("Paramètres sauvegardés et agent vocal mis à jour.");
      } else {
        setErrorMessage(result.error ?? "Une erreur est survenue.");

        if (forwardingEnabled !== initialData.callForwardingEnabled) {
          setForwardingEnabled(initialData.callForwardingEnabled);
        }
      }
    });
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <PhoneForwarded className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Transfert d&apos;appel</CardTitle>
            <CardDescription className="mt-1">
              Permettez à votre assistant vocal de transférer un appel vers vous si le
              client le demande explicitement.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {}
        {initialData.twilioPhoneNumber && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Numéro Twilio (ligne de l&apos;assistant)
            </Label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted border border-border">
              <span className="font-mono text-sm font-medium tracking-wide">
                {initialData.twilioPhoneNumber}
              </span>
              <Badge variant="secondary" className="text-xs ml-auto">
                Lecture seule
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              C&apos;est le numéro que vos clients appellent. Il est géré par l&apos;administrateur.
            </p>
          </div>
        )}

        {}
        <div className="space-y-2">
          <Label htmlFor="forwarding-number" className="text-sm font-medium">
            Numéro principal du restaurant (redirection)
          </Label>
          <Input
            id="forwarding-number"
            type="tel"
            placeholder="0612345678"
            value={forwardingNumber}
            onChange={(e) => {
              setForwardingNumber(e.target.value);
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className="font-mono"
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">
            C&apos;est ce numéro qui sera utilisé pour le transfert d&apos;appel.
          </p>
        </div>

        {}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
          <div className="space-y-1">
            <p className="text-sm font-medium">Activer le transfert d&apos;appel</p>
            <p className="text-xs text-muted-foreground">
              {forwardingEnabled
                ? "L'assistant peut transférer vers votre numéro sur demande du client."
                : "Le transfert d'appel est désactivé."}
            </p>
          </div>
          <Switch
            checked={forwardingEnabled}
            onCheckedChange={(val) => {
              setForwardingEnabled(val);
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            disabled={isPending}
            aria-label="Activer le transfert d'appel"
          />
        </div>

        {}
        {successMessage && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {errorMessage}
          </div>
        )}

        {}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={isPending || !isDirty}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sauvegarde en cours…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
