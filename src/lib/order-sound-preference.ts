/**
 * Préférence « sonnerie de nouvelle commande », stockée dans le navigateur.
 *
 * Exposée comme un petit store externe plutôt que comme un état React : la
 * valeur vit dans `localStorage`, ce qui permet de la lire sans provoquer de
 * décalage d'hydratation et de la synchroniser entre les onglets ouverts sur la
 * même tablette.
 */

const STORAGE_KEY = "yallo_order_sound_enabled";

const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

export function subscribeOrderSoundPreference(listener: () => void): () => void {
  listeners.add(listener);
  globalThis.window?.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    globalThis.window?.removeEventListener("storage", listener);
  };
}

/** Activée par défaut : une cuisine doit entendre ses commandes. */
export function getOrderSoundPreference(): boolean {
  return globalThis.localStorage?.getItem(STORAGE_KEY) !== "false";
}

/** Rendu serveur : on part du réglage par défaut. */
export function getOrderSoundPreferenceServerSnapshot(): boolean {
  return true;
}

export function setOrderSoundPreference(enabled: boolean): void {
  globalThis.localStorage?.setItem(STORAGE_KEY, String(enabled));
  notify();
}
