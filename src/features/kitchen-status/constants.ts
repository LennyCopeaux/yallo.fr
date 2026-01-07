import { type StatusSettings } from "./actions";

// Valeurs par défaut pour les paramètres de statut
export const DEFAULT_STATUS_SETTINGS: StatusSettings = {
  CALM: { fixed: 15 },
  NORMAL: { min: 25, max: 35 },
  RUSH: { min: 45, max: 60 },
  STOP: { message: "Nous ne prenons plus de commandes" },
};

