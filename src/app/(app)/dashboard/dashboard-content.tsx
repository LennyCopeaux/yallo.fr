"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrdersGrid } from "./orders-grid";
import { type Order } from "@/components/orders";
import { 
  TrendingUp, 
  ShoppingCart, 
  Clock, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface DashboardContentProps {
  orders: Order[];
}

type FilterStatus = "all" | "new" | "preparing" | "completed";

type DeltaMeta =
  | { kind: "increase" | "decrease" | "flat"; value: number }
  | { kind: "new" };

export function DashboardContent({ orders }: Readonly<DashboardContentProps>) {
  const [filter, setFilter] = useState<FilterStatus>("all");

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
  const completedOrders = orders.filter(
    (o) => o.status === "DELIVERED" || o.status === "CANCELLED"
  );

  // Filtrer les commandes selon le filtre actif
  const filteredOrders = (() => {
    switch (filter) {
      case "new":
        return orders.filter((o) => o.status === "NEW");
      case "preparing":
        return orders.filter((o) => o.status === "PREPARING");
      case "completed":
        return orders.filter(
          (o) => o.status === "DELIVERED" || o.status === "CANCELLED"
        );
      default:
        return orders;
    }
  })();

  return (
    <div className="space-y-8">
      {/* KPIs Section */}
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

        {/* Temps moyen IA */}
        <Card className="bg-card border-border hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Temps moyen IA
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span>Mesure bientot disponible</span>
            </p>
          </CardContent>
        </Card>
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

      {/* Orders Section with Filters */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <span className="text-2xl">📋</span>{" "}
                Suivi des Commandes
              </CardTitle>
              <CardDescription className="mt-1">
                Gérez vos commandes en temps réel
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="relative">
                Toutes
                {orders.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {orders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="new" className="relative">
                Nouvelles
                {newOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-blue-500/20 text-blue-600">
                    {newOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="preparing" className="relative">
                En préparation
                {preparingOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-orange-500/20 text-orange-600">
                    {preparingOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="relative">
                Terminées
                {completedOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {completedOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Orders Grid */}
          <OrdersGrid initialOrders={filteredOrders} />
        </CardContent>
      </Card>
    </div>
  );
}

