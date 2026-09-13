"use client";

import { useEffect, useState } from "react";
import { getNewOrderIds } from "@/features/orders/actions";
import { NewOrderAlertBar } from "./new-order-alert-bar";
import { useNewOrderAlert } from "./use-new-order-alert";

const POLL_MS = 15_000;

/**
 * Alerte cuisine montée sur tout le dashboard, pas seulement /orders :
 * une commande passée pendant que le gérant est sur le menu ou l'accueil
 * doit quand même sonner.
 */
export function DashboardKitchenAlert() {
  const [orders, setOrders] = useState<{ id: string; status: string }[]>([]);
  const alert = useNewOrderAlert(orders);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const next = await getNewOrderIds();
        if (!cancelled) setOrders(next);
      } catch {
        // Un échec de polling ne doit pas casser le dashboard.
      }
    };

    void refresh();
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="px-4 pt-4 sm:px-6 lg:px-8">
      <NewOrderAlertBar alert={alert} />
    </div>
  );
}
