import { Phone, Clock, Euro, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CallUsage } from "@/features/billing/usage-actions";

interface UsageSectionProps {
  usage: CallUsage;
}

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

export function UsageSection({ usage }: Readonly<UsageSectionProps>) {
  const { minutesUsed, callCount, estimatedCostCents, callRateCentsPerMinute, periodStart, periodEnd } = usage;

  return (
    <div className="mt-10">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Consommation du mois</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Période du {formatDate(periodStart)}
          {periodEnd ? ` au ${formatDate(periodEnd)}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Minutes consommées */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Minutes consommées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{minutesUsed}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {callCount} appel{callCount !== 1 ? "s" : ""} ce mois
            </p>
          </CardContent>
        </Card>

        {/* Coût estimé */}
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

        {/* Nombre d'appels */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Appels traités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{callCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {minutesUsed > 0 && callCount > 0
                ? `${(minutesUsed / callCount).toFixed(1)} min / appel en moyenne`
                : "Aucune donnée"}
            </p>
          </CardContent>
        </Card>

        {/* Remise à zéro */}
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

      {callCount === 0 && (
        <p className="text-sm text-muted-foreground mt-6 text-center">
          Aucun appel enregistré sur cette période. Les statistiques apparaîtront dès le premier appel traité par votre IA.
        </p>
      )}
    </div>
  );
}
