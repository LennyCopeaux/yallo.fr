"use client";

import { useState, useTransition, useEffect } from "react";
import { OrderTicket, type Order } from "@/components/orders";
import { updateOrderStatus } from "@/features/orders/actions";
import { type OrderStatus } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OrdersGridProps {
  initialOrders: Order[];
}

const AUTO_REFRESH_INTERVAL_MS = 15_000;

export function OrdersGrid({ initialOrders }: Readonly<OrdersGridProps>) {
  const [orders, setOrders] = useState(initialOrders);
  const [, startTransition] = useTransition();
  const router = useRouter();

  // Synchroniser les orders avec initialOrders quand ils changent (filtres)
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const updateOrderInList = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    );
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus);
        updateOrderInList(orderId, newStatus);
        toast.success("Statut mis à jour");
      } catch {
        toast.error("Erreur lors de la mise à jour");
      }
    });
  };

  const handleRefresh = () => {
    router.refresh();
  };

  useEffect(() => {
    // Vercel ne fournit pas de WebSocket natif sans service externe: on utilise un polling léger.
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [router]);

  // Afficher toutes les commandes (le filtrage est déjà fait par DashboardContent)
  // Mais on peut toujours séparer actives et terminées pour l'affichage
  const activeOrders = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
  );
  const completedOrders = orders.filter(
    (o) => o.status === "DELIVERED" || o.status === "CANCELLED"
  );
  
  // Si toutes les commandes sont actives, on les affiche toutes ensemble
  const displayOrders = completedOrders.length === 0 ? orders : activeOrders;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <span className="text-5xl">📋</span>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-center">Aucune commande</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Les commandes prises par votre assistant vocal apparaîtront ici en temps réel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">
            {orders.length} commande{orders.length > 1 ? "s" : ""}
            {activeOrders.length > 0 && ` (${activeOrders.length} en cours)`}
          </h2>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      {displayOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayOrders.map((order) => (
            <OrderTicket
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Completed Orders Section (seulement si on affiche toutes les commandes) */}
      {completedOrders.length > 0 && activeOrders.length > 0 && (
        <div className="pt-8 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Commandes terminées
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {completedOrders.slice(0, 6).map((order) => (
              <OrderTicket key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

