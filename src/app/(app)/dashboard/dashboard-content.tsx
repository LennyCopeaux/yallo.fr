"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrdersGrid } from "./orders-grid";
import { type Order } from "@/features/orders/components";
import { 
  TrendingUp, 
  ShoppingCart, 
  Clock, 
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface DashboardContentProps {
  orders: Order[];
}

type FilterStatus = "all" | "new" | "preparing" | "completed";

export function DashboardContent({ orders }: DashboardContentProps) {
  const [filter, setFilter] = useState<FilterStatus>("all");

  // Calculs des KPIs
  const todayOrders = orders.filter((o) => {
    if (!o.createdAt) return false;
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const averageBasket = todayOrders.length > 0 
    ? Math.round(todayRevenue / todayOrders.length) 
    : 0;
  
  const activeOrders = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
  );
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
            <div className="text-2xl font-bold">{(todayRevenue / 100).toFixed(2).replace(".", ",")}€</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">+12.5%</span> vs hier
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
              <span>{activeOrders.length} en cours</span>
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
            <div className="text-2xl font-bold">{(averageBasket / 100).toFixed(2).replace(".", ",")}€</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">+3.2%</span> vs hier
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
            <div className="text-2xl font-bold">1m 30s</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-orange-500" />
              <span className="text-orange-500">-5s</span> vs hier
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
          <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/30">
            <div className="text-center space-y-2">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm text-muted-foreground font-medium">
                Graphique des commandes
              </p>
              <p className="text-xs text-muted-foreground">
                Les données en temps réel seront affichées ici
              </p>
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
                <span className="text-2xl">📋</span>
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
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400">
                    {newOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="preparing" className="relative">
                En préparation
                {preparingOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400">
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

