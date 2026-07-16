"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { type Order } from "@/components/orders";
import { useState, useTransition } from "react";
import { 
  TrendingUp, 
  ShoppingCart, 
  Clock, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  PhoneCall,
  RefreshCw,
  Mic,
  Star,
  Phone,
  Zap,
} from "lucide-react";

import {
  getRestaurantCallStats,
  type RestaurantCallStats,
  type DateRangeFilter,
} from "@/features/orders/actions";

const DATE_RANGE_OPTIONS: { value: DateRangeFilter; label: string }[] = [
  { value: "all_time", label: "Tout le temps" },
  { value: "last_7_days", label: "7 derniers jours" },
  { value: "last_30_days", label: "30 derniers jours" },
  { value: "current_month", label: "Mois en cours" },
  { value: "previous_month", label: "Mois précédent" },
];

interface DashboardContentProps {
  orders: Order[];
  callStats: RestaurantCallStats | null;
}

type DeltaMeta =
  | { kind: "increase" | "decrease" | "flat"; value: number }
  | { kind: "new" };

export function DashboardContent({ orders, callStats: initialCallStats }: Readonly<DashboardContentProps>) {
  const [callStats, setCallStats] = useState<RestaurantCallStats | null>(initialCallStats);
  const [callRangeFilter, setCallRangeFilter] = useState<DateRangeFilter>("all_time");
  const [isPendingCallStats, startCallStatsTransition] = useTransition();

  function handleCallRangeChange(filter: DateRangeFilter) {
    setCallRangeFilter(filter);
    startCallStatsTransition(async () => {
      const stats = await getRestaurantCallStats(filter);
      setCallStats(stats);
    });
  }

  const getDeltaMeta = (current: number, previous: number): DeltaMeta => {
    if (previous === 0 && current === 0) {
      return { kind: "flat", value: 0 };
    }

    if (previous === 0 && current > 0) {
      return { kind: "new" };
    }

    const delta = ((current - previous) / previous) * 100;

    if (!Number.isFinite(delta)) {
      return { kind: "flat", value: 0 };
    }

    if (delta > 0) {
      return { kind: "increase", value: delta };
    }

    if (delta < 0) {
      return { kind: "decrease", value: delta };
    }

    return { kind: "flat", value: 0 };
  };

  const formatDeltaValue = (value: number) => `${value.toFixed(1).replaceAll(".", ",")}%`;

  const renderDelta = (meta: DeltaMeta) => {
    if (meta.kind === "new") {
      return <span className="text-emerald-500">+100%+ vs hier</span>;
    }

    if (meta.kind === "increase") {
      return (
        <>
          <ArrowUpRight className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-500">+{formatDeltaValue(meta.value)}</span> vs hier
        </>
      );
    }

    if (meta.kind === "decrease") {
      return (
        <>
          <ArrowDownRight className="h-3 w-3 text-orange-500" />
          <span className="text-orange-500">{formatDeltaValue(meta.value)}</span> vs hier
        </>
      );
    }

    return <span>0,0% vs hier</span>;
  };

  // Calculs des KPIs
  const todayOrders = orders.filter((o) => {
    if (!o.createdAt) return false;
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });

  const yesterdayOrders = orders.filter((o) => {
    if (!o.createdAt) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === yesterday.toDateString();
  });

  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const averageBasket = todayOrders.length > 0 
    ? Math.round(todayRevenue / todayOrders.length) 
    : 0;
  const yesterdayAverageBasket =
    yesterdayOrders.length > 0 ? Math.round(yesterdayRevenue / yesterdayOrders.length) : 0;

  const revenueDelta = getDeltaMeta(todayRevenue, yesterdayRevenue);
  const ordersDelta = getDeltaMeta(todayOrders.length, yesterdayOrders.length);
  const basketDelta = getDeltaMeta(averageBasket, yesterdayAverageBasket);

  const hourlyBuckets = Array.from({ length: 24 }, (_, hour) => {
    const count = todayOrders.filter((order) => {
      if (!order.createdAt) return false;
      return new Date(order.createdAt).getHours() === hour;
    }).length;

    return { hour, count };
  });

  const maxHourlyCount = Math.max(1, ...hourlyBuckets.map((bucket) => bucket.count));
  const midHourlyCount = Math.ceil(maxHourlyCount / 2);
  
  const newOrders = orders.filter((o) => o.status === "NEW");
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");

  return (
    <div className="space-y-8">
      {/* KPIs Section — Commandes du jour */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chiffre du jour */}
        <Card className="bg-card border-border hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chiffre du jour
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(todayRevenue / 100).toFixed(2).replaceAll(".", ",")}€</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {renderDelta(revenueDelta)}
            </p>
          </CardContent>
        </Card>

        {/* Commandes */}
        <Card className="bg-card border-border hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commandes
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {renderDelta(ordersDelta)}
            </p>
          </CardContent>
        </Card>

        {/* Panier moyen */}
        <Card className="bg-card border-border hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Panier moyen
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(averageBasket / 100).toFixed(2).replaceAll(".", ",")}€</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {renderDelta(basketDelta)}
            </p>
          </CardContent>
        </Card>

        {/* Total commandes (toutes) */}
        <Card className="bg-card border-border hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total commandes
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">depuis le début</p>
          </CardContent>
        </Card>
      </div>

      {/* Section IA — Métriques avec filtre de période */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Performances IA
            </h2>
            {isPendingCallStats && <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleCallRangeChange(opt.value)}
                disabled={isPendingCallStats}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  callRangeFilter === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity ${isPendingCallStats ? "opacity-50" : ""}`}>
          {/* Temps moyen IA */}
          <Card className="bg-card border-border hover:border-primary/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Temps moyen IA
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {callStats?.avgDurationSeconds != null
                  ? `${callStats.avgDurationSeconds}s`
                  : "--"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">par appel</p>
            </CardContent>
          </Card>

          {/* Appels IA */}
          <Card className="bg-card border-border hover:border-primary/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Appels IA
              </CardTitle>
              <PhoneCall className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {callStats?.totalCallsAllTime ?? "--"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">sur la période</p>
            </CardContent>
          </Card>

          {/* Taux de décroché — placeholder */}
          <Card className="bg-card border-border hover:border-primary/20 transition-colors opacity-60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taux de décroché
              </CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">bientôt disponible</p>
            </CardContent>
          </Card>

          {/* Satisfaction client — placeholder */}
          <Card className="bg-card border-border hover:border-primary/20 transition-colors opacity-60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Satisfaction client
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">bientôt disponible</p>
            </CardContent>
          </Card>
        </div>

        {/* Deuxième ligne de métriques IA (placeholders) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 opacity-60">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Appels transférés
              </CardTitle>
              <PhoneCall className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">bientôt disponible</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taux commande / appel
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">bientôt disponible</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Heure de pointe
              </CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">bientôt disponible</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                CA généré via IA
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">bientôt disponible</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Graphique Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Aperçu de l&apos;activité</CardTitle>
              <CardDescription className="mt-1">
                Commandes par heure aujourd&apos;hui
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Temps réel
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="h-[200px] grid grid-cols-[40px_1fr] gap-3">
              <div className="h-full flex flex-col justify-between text-xs text-muted-foreground">
                <span>{maxHourlyCount}</span>
                <span>{midHourlyCount}</span>
                <span>0</span>
              </div>

              <div className="relative h-full">
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                  <div className="border-t border-border/70" />
                  <div className="border-t border-border/50" />
                  <div className="border-t border-border/70" />
                </div>

                <div className="relative z-10 h-full grid grid-cols-24 items-end gap-1">
                  {hourlyBuckets.map((bucket) => {
                    const heightPercent = Math.max(
                      6,
                      Math.round((bucket.count / maxHourlyCount) * 100)
                    );

                    return (
                      <div
                        key={bucket.hour}
                        className="group relative h-full flex items-end"
                        title={`${bucket.hour.toString().padStart(2, "0")}h : ${bucket.count} commande${bucket.count > 1 ? "s" : ""}`}
                      >
                        <div
                          className="w-full rounded-t bg-primary/70 group-hover:bg-primary transition-colors"
                          style={{ height: `${bucket.count === 0 ? 4 : heightPercent}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-3 ml-[43px] flex items-center justify-between text-xs text-muted-foreground">
              <span>00h</span>
              <span>12h</span>
              <span>23h</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA → page Commandes */}
      <Link href="/dashboard/orders">
        <Card className="bg-card border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base">Suivi des commandes</p>
                <p className="text-sm text-muted-foreground">
                  {newOrders.length > 0 ? (
                    <span className="text-blue-500 font-medium">{newOrders.length} nouvelle{newOrders.length > 1 ? "s" : ""} • </span>
                  ) : null}
                  {preparingOrders.length} en préparation aujourd&apos;hui
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

