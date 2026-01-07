import { type StatusSettings } from "./actions";
import { type KitchenStatus } from "@/db/schema";

/**
 * Génère la phrase de temps d'attente à annoncer au client selon le statut de la cuisine.
 * 
 * @param status - Le statut actuel de la cuisine (CALM, NORMAL, RUSH, STOP)
 * @param settings - Les paramètres de configuration des délais
 * @returns La phrase à annoncer au client
 * 
 * @example
 * // Si CALM avec min=15, max=15
 * generateWaitTimePhrase("CALM", { CALM: { min: 15, max: 15 } })
 * // => "15 minutes"
 * 
 * @example
 * // Si RUSH avec min=45, max=60
 * generateWaitTimePhrase("RUSH", { RUSH: { min: 45, max: 60 } })
 * // => "entre 45 et 60 minutes"
 * 
 * @example
 * // Si STOP
 * generateWaitTimePhrase("STOP", { STOP: { message: "Nous ne prenons plus de commandes" } })
 * // => "Nous ne prenons plus de commandes"
 */
export function generateWaitTimePhrase(
  status: KitchenStatus,
  settings: StatusSettings | null
): string {
  // Si le statut est STOP, retourner le message personnalisé
  if (status === "STOP") {
    const stopMessage = settings?.STOP?.message || "Nous ne prenons plus de commandes pour le moment";
    return stopMessage;
  }

  // Récupérer les paramètres pour le statut actuel
  const statusConfig = settings?.[status];

  // Si pas de configuration, utiliser des valeurs par défaut
  if (!statusConfig) {
    const defaults: Record<Exclude<KitchenStatus, "STOP">, { fixed: number } | { min: number; max: number }> = {
      CALM: { fixed: 15 },
      NORMAL: { min: 25, max: 35 },
      RUSH: { min: 45, max: 60 },
    };
    const defaultConfig = defaults[status];
    
    if ("fixed" in defaultConfig) {
      return `${defaultConfig.fixed} minutes`;
    }
    return `entre ${defaultConfig.min} et ${defaultConfig.max} minutes`;
  }

  // Si délai fixe
  if ("fixed" in statusConfig) {
    return `${statusConfig.fixed} minutes`;
  }

  // Sinon, retourner une fourchette
  return `entre ${statusConfig.min} et ${statusConfig.max} minutes`;
}

/**
 * Récupère le contexte de statut de la cuisine pour l'IA Vapi.
 * Cette fonction peut être utilisée dans le systemPrompt ou comme variable de contexte.
 * 
 * @param status - Le statut actuel de la cuisine
 * @param settings - Les paramètres de configuration des délais
 * @returns Un objet avec le statut et la phrase de temps d'attente
 */
export function getKitchenStatusContext(
  status: KitchenStatus,
  settings: StatusSettings | null
): {
  status: KitchenStatus;
  waitTimePhrase: string;
  isAcceptingOrders: boolean;
} {
  return {
    status,
    waitTimePhrase: generateWaitTimePhrase(status, settings),
    isAcceptingOrders: status !== "STOP",
  };
}

