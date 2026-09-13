"use client";

import { Phone, Clock, Euro, CalendarClock, Timer, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useTransition } from "react";
import {
  getCallUsageForCurrentPeriod,
  type CallUsage,
  type DateRangeFilter,
} from "@/features/billing/usage-actions";

interface UsageSectionProps {
  usage: CallUsage;
}

const DATE_RANGE_OPTIONS: { value: DateRangeFilter; label: string }[] = [
  { value: "billing_period", label: "Période en cours" },
  { value: "last_7_days", label: "7 derniers jours" },
  { value: "last_30_days", label: "30 derniers jours" },
  { value: "current_month", label: "Mois en cours" },
  { value: "previous_month", label: "Mois précédent" },
  { value: "all_time", label: "Tout le temps" },
];

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function UsageSection({ usage: initialUsage }: Readonly<UsageSectionProps>) {
  const [usage, setUsage] = useState<CallUsage>(initialUsage);
  const [isPending, startTransition] = useTransition();

  const { minutesUsed, callCount, estimatedCostCents, callRateCentsPerMinute, periodStart, periodEnd, rangeFilter } = usage;

  const avgSecondsPerCall =
    callCount > 0 && minutesUsed > 0
      ? Math.round((minutesUsed * 60) / callCount)
      : null;

  function handleRangeChange(filter: DateRangeFilter) {
    startTransition(async () => {
      const result = await getCallUsageForCurrentPeriod(filter);
      if (result.success) {
        setUsage(result.data);
      }
    });
  }

  return (
    <div className="mt-10">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">Consommation</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Du {formatDate(periodStart)}
            {periodEnd ? ` au ${formatDate(periodEnd)}` : ""}
          </p>
        </div>

        {}
        <div className="flex items-center gap-1.5 flex-wrap">
          {isPending && <RefreshCw className="w-3.5 h-3.5 text-muted-foreground animate-spin shrink-0" />}
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleRangeChange(opt.value)}
              disabled={isPending}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                rangeFilter === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 transition-opacity ${isPending ? "opacity-50" : ""}`}>
        {}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Minutes consommées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{minutesUsed}</p>
            <p className="text-xs text-muted-foreground mt-1">sur la période</p>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Euro className="w-4 h-4" />
              Coût estimé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCents(estimatedCostCents)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {(callRateCentsPerMinute / 100).toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
              })} / minute
            </p>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Appels traités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{callCount}</p>
            <p className="text-xs text-muted-foreground mt-1">sur la période</p>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Durée moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {avgSecondsPerCall !== null ? `${avgSecondsPerCall}s` : "--"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">par appel</p>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarClock className="w-4 h-4" />
              Remise à zéro
            </CardTitle>
          </CardHeader>
          <CardContent>
            {periodEnd ? (
              <>
                <p className="text-lg font-bold leading-tight">
                  {periodEnd.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(periodEnd)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Non disponible</p>
            )}
          </CardContent>
        </Card>
      </div>

      {callCount === 0 ? (
        <p className="text-sm text-muted-foreground mt-6 text-center">
          Aucun appel enregistré sur cette période. Les statistiques apparaîtront dès le premier appel traité par votre IA.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground mt-6 text-center">
          Les minutes consommées sont ajoutées automatiquement à votre prochaine facture
          d&apos;abonnement, à la minute entamée.
        </p>
      )}
    </div>
  );
}

