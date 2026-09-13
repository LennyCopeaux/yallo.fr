"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { OrdersGrid } from "@/app/(app)/dashboard/orders-grid";
import { NewOrderAlertBar, useNewOrderAlert, type Order } from "@/components/orders";

interface OrdersPageContentProps {
  orders: Order[];
}

type FilterStatus = "all" | "new" | "preparing" | "completed";

export function OrdersPageContent({ orders }: Readonly<OrdersPageContentProps>) {
  const [filter, setFilter] = useState<FilterStatus>("all");

  // Surveille la liste complète, pas l'onglet affiché : une commande doit
  // sonner même si la cuisine consulte l'onglet « Terminées ».
  const alert = useNewOrderAlert(orders);

  const newOrders = orders.filter((o) => o.status === "NEW");
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");
  const completedOrders = orders.filter(
    (o) => o.status === "DELIVERED" || o.status === "CANCELLED"
  );

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
    <div className="space-y-6">
      <NewOrderAlertBar alert={alert} />

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

      <OrdersGrid initialOrders={filteredOrders} />
    </div>
  );
}
