"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { OrderTicket, type Order } from "@/components/orders";
import { simulateSubmitOrder, updateOrderStatus } from "@/features/orders/actions";
import { type OrderStatus } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OrdersGridProps {
  initialOrders: Order[];
  /** Rafraîchit la liste depuis le serveur (données seules, pas le layout). */
  onRefresh?: () => void | Promise<void>;
}

const IS_DEV = process.env.NODE_ENV !== "production";

export function OrdersGrid({ initialOrders, onRefresh }: Readonly<OrdersGridProps>) {
  const [orders, setOrders] = useState(initialOrders);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(() => new Set());
  const [, startTransition] = useTransition();
  const router = useRouter();

  // Statuts affichés avant confirmation serveur. Un rafraîchissement du serveur
  // (polling 15 s) qui arrive pendant l'attente ne doit pas les écraser.
  const optimisticStatuses = useRef(new Map<string, OrderStatus>());
  // Miroir de l'état pour que handleStatusChange garde une identité stable
  // (les tickets sont mémoïsés : une nouvelle fonction à chaque rendu
  // annulerait la mémoïsation).
  const ordersRef = useRef(orders);
  ordersRef.current = orders;
  const pendingRef = useRef(pendingIds);
  pendingRef.current = pendingIds;

  useEffect(() => {
    const overrides = optimisticStatuses.current;
    setOrders(
      overrides.size === 0
        ? initialOrders
        : initialOrders.map((order) => {
            const status = overrides.get(order.id);
            return status ? { ...order, status } : order;
          })
    );
  }, [initialOrders]);

  const updateOrderInList = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    );
  }, []);

  const setPending = useCallback((orderId: string, pending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(orderId);
      else next.delete(orderId);
      return next;
    });
  }, []);

  const handleStatusChange = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      // Un clic pendant l'attente est ignoré : le bouton est aussi désactivé côté ticket.
      if (pendingRef.current.has(orderId)) return;

      const previousStatus = ordersRef.current.find((order) => order.id === orderId)?.status;
      if (!previousStatus) return;

      // Optimiste : la cuisine voit le changement tout de suite, le serveur confirme derrière.
      optimisticStatuses.current.set(orderId, newStatus);
      updateOrderInList(orderId, newStatus);
      setPending(orderId, true);

      startTransition(async () => {
        try {
          // revalidatePath dans l'action renvoie déjà la page à jour : pas de router.refresh() en plus.
          await updateOrderStatus(orderId, newStatus);
          toast.success("Statut mis à jour");
        } catch {
          updateOrderInList(orderId, previousStatus);
          toast.error("Erreur lors de la mise à jour");
        } finally {
          optimisticStatuses.current.delete(orderId);
          setPending(orderId, false);
        }
      });
    },
    [setPending, updateOrderInList]
  );

  const handleSimulateSubmitOrder = () => {
    startTransition(async () => {
      try {
        await simulateSubmitOrder();
        router.refresh();
        toast.success("Commande de test ajoutee");
      } catch {
        toast.error("Erreur lors de la simulation submit_order");
      }
    });
  };

  const handleRefresh = () => {
    if (onRefresh) void onRefresh();
    else router.refresh();
  };

  const activeOrders = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
  );
  const completedOrders = orders.filter(
    (o) => o.status === "DELIVERED" || o.status === "CANCELLED"
  );

  const displayOrders = completedOrders.length === 0 ? orders : activeOrders;

  return (
    <div className="space-y-8">
      {}
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
        {IS_DEV && (
          <Button size="sm" variant="outline" onClick={handleSimulateSubmitOrder}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Simuler submit_order
          </Button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <span className="text-5xl">📋</span>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-center">Aucune commande</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Les commandes prises par votre assistant vocal apparaîtront ici en temps réel.
          </p>
        </div>
      ) : null}

      {}
      {displayOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayOrders.map((order) => (
            <OrderTicket
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              isPending={pendingIds.has(order.id)}
            />
          ))}
        </div>
      )}

      {}
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

