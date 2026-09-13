"use client";

import { BellRing, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NewOrderAlert } from "./use-new-order-alert";

interface NewOrderAlertBarProps {
  alert: NewOrderAlert;
}

export function NewOrderAlertBar({ alert }: Readonly<NewOrderAlertBarProps>) {
  const { unseenCount, soundEnabled, soundBlocked, enableSound, toggleSound, acknowledge } =
    alert;

  const hasArrivals = unseenCount > 0;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
        hasArrivals
          ? "border-blue-500/40 bg-blue-500/10"
          : "border-border bg-muted/20"
      )}
      aria-live="polite"
    >
      <BellRing
        className={cn(
          "h-5 w-5 shrink-0",
          hasArrivals ? "text-blue-500 animate-pulse" : "text-muted-foreground"
        )}
      />

      <p className="flex-1 text-sm">
        {hasArrivals ? (
          <span className="font-semibold text-blue-500">
            {unseenCount} nouvelle{unseenCount > 1 ? "s" : ""} commande
            {unseenCount > 1 ? "s" : ""} depuis votre dernier passage
          </span>
        ) : (
          <span className="text-muted-foreground">
            Aucune nouvelle commande. L&apos;écran se met à jour automatiquement.
          </span>
        )}
      </p>

      {soundBlocked && soundEnabled && (
        <Button size="sm" onClick={enableSound}>
          <Volume2 className="mr-2 h-4 w-4" />
          Activer le son
        </Button>
      )}

      {hasArrivals && (
        <Button size="sm" variant="outline" onClick={acknowledge}>
          J&apos;ai vu
        </Button>
      )}

      <Button
        size="icon"
        variant="ghost"
        onClick={toggleSound}
        aria-label={soundEnabled ? "Couper la sonnerie" : "Activer la sonnerie"}
        title={soundEnabled ? "Couper la sonnerie" : "Activer la sonnerie"}
      >
        {soundEnabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
