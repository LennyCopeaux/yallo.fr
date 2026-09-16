"use client";

import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { OrdersGrid } from "@/app/(app)/dashboard/orders-grid";
import { type Order } from "@/components/orders";
import { getOrdersSnapshot } from "@/features/orders/actions";

interface OrdersPageContentProps {
  initialOrders: Order[];
}

type FilterStatus = "all" | "new" | "preparing" | "completed";

/**
 * Rafraîchissement de la liste : un appel de données léger, pas un
 * `router.refresh()` qui rejouerait le layout complet du dashboard.
 */
const POLL_INTERVAL_MS = 15_000;

export function OrdersPageContent({ initialOrders }: Readonly<OrdersPageContentProps>) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Après une action serveur (changement de statut), la page est re-rendue
  // avec des données fraîches : on les prend comme nouvelle base.
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const refresh = useCallback(async () => {
    try {
      const next = await getOrdersSnapshot();
      setOrders(next);
    } catch {
      // Un polling raté ne doit pas casser la tablette : on garde l'état courant.
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [refresh]);

  const newOrders = orders.filter((o) => o.status === "NEW");
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");
  const completedOrders = orders.filter(
    (o) => o.status === "DELIVERED" || o.status === "CANCELLED"
  );

  const filteredOrders = (() => {
    switch (filter) {
      case "new":
        return newOrders;
      case "preparing":
        return preparingOrders;
      case "completed":
        return completedOrders;
      default:
        return orders;
    }
  })();

  return (
    <div className="space-y-6">
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

      <OrdersGrid initialOrders={filteredOrders} onRefresh={refresh} />
    </div>
  );
}
