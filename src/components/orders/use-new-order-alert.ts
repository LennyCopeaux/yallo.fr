"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { playOrderChime, unlockOrderChime } from "@/lib/order-chime";
import {
  getOrderSoundPreference,
  getOrderSoundPreferenceServerSnapshot,
  setOrderSoundPreference,
  subscribeOrderSoundPreference,
} from "@/lib/order-sound-preference";

type TrackedOrder = {
  id: string;
  status: string;
};

export type NewOrderAlert = {
  /** Commandes arrivées et pas encore acquittées par la cuisine. */
  unseenCount: number;
  soundEnabled: boolean;
  /** Le navigateur exige un clic avant d'autoriser le son. */
  soundBlocked: boolean;
  enableSound: () => void;
  toggleSound: () => void;
  acknowledge: () => void;
};

/**
 * Détecte l'arrivée de nouvelles commandes entre deux rafraîchissements et
 * alerte la cuisine : sonnerie, compteur, et titre d'onglet.
 *
 * Les commandes déjà présentes au premier rendu ne déclenchent rien — on ne
 * sonne que pour ce qui arrive après l'ouverture de l'écran.
 */
export function useNewOrderAlert(orders: TrackedOrder[]): NewOrderAlert {
  const knownOrderIdsRef = useRef<Set<string> | null>(null);
  const [unseenCount, setUnseenCount] = useState(0);
  const [soundBlocked, setSoundBlocked] = useState(false);

  const soundEnabled = useSyncExternalStore(
    subscribeOrderSoundPreference,
    getOrderSoundPreference,
    getOrderSoundPreferenceServerSnapshot
  );

  // Tente de lever le blocage audio dès l'ouverture de l'écran : si le
  // navigateur refuse encore, on propose un bouton explicite plutôt que de
  // laisser passer la première commande en silence.
  useEffect(() => {
    let cancelled = false;

    void unlockOrderChime().then((unlocked) => {
      if (!cancelled) setSoundBlocked(!unlocked);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const incomingIds = orders.filter((order) => order.status === "NEW").map((o) => o.id);

    // Premier rendu : on mémorise l'existant sans alerter.
    if (knownOrderIdsRef.current === null) {
      knownOrderIdsRef.current = new Set(incomingIds);
      return;
    }

    const known = knownOrderIdsRef.current;
    const arrivals = incomingIds.filter((id) => !known.has(id));
    for (const id of incomingIds) known.add(id);

    if (arrivals.length === 0) return;

    setUnseenCount((previous) => previous + arrivals.length);

    if (soundEnabled) {
      const played = playOrderChime();
      if (!played) setSoundBlocked(true);
    }
  }, [orders, soundEnabled]);

  // Rend l'alerte visible même quand la tablette est sur un autre onglet.
  useEffect(() => {
    if (typeof document === "undefined") return;

    const baseTitle = "Commandes · Yallo";
    document.title = unseenCount > 0 ? `(${unseenCount}) ${baseTitle}` : baseTitle;

    return () => {
      document.title = baseTitle;
    };
  }, [unseenCount]);

  const enableSound = useCallback(() => {
    void unlockOrderChime().then((unlocked) => {
      setSoundBlocked(!unlocked);
      if (unlocked) {
        setOrderSoundPreference(true);
        playOrderChime();
      }
    });
  }, []);

  const toggleSound = useCallback(() => {
    const next = !getOrderSoundPreference();
    setOrderSoundPreference(next);

    if (next) {
      void unlockOrderChime().then((unlocked) => setSoundBlocked(!unlocked));
    }
  }, []);

  const acknowledge = useCallback(() => setUnseenCount(0), []);

  return {
    unseenCount,
    soundEnabled,
    soundBlocked,
    enableSound,
    toggleSound,
    acknowledge,
  };
}
