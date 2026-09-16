"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Clock, TrendingUp, CalendarDays } from "lucide-react";
import type { RestaurantCallStats } from "@/app/(admin)/admin/queries";

interface UsageTabProps {
  stats: RestaurantCallStats;
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

// Les statistiques arrivent en props depuis la page serveur : l'onglet est
// démonté à chaque changement d'onglet et relançait sinon la lecture à chaque retour.
export function UsageTab({ stats }: Readonly<UsageTabProps>) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">30 derniers jours</h3>
        <p className="text-sm text-muted-foreground">Activité récente du restaurant</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Appels (30j)</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.last30Days.callCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.last30Days.totalMinutes} minutes consommées
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Minutes (30j)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.last30Days.totalMinutes}</div>
            <p className="text-xs text-muted-foreground mt-1">minutes IA consommées</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-base font-semibold">Tout le temps</h3>
        <p className="text-sm text-muted-foreground">Statistiques cumulées depuis le début</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total appels</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.allTime.callCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total minutes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.allTime.totalMinutes}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Durée moyenne</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSeconds(stats.allTime.avgSeconds)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
