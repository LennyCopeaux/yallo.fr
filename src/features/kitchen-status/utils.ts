import { type StatusSettings } from "./actions";
import { type KitchenStatus } from "@/db/schema";

const DEFAULT_WAIT_TIMES: Record<Exclude<KitchenStatus, "STOP">, { fixed: number } | { min: number; max: number }> = {
  CALM: { fixed: 15 },
  NORMAL: { min: 25, max: 35 },
  RUSH: { min: 45, max: 60 },
};

function formatDelayPhrase(config: { fixed: number } | { min: number; max: number }): string {
  if ("fixed" in config) return `${config.fixed} minutes`;
  return `entre ${config.min} et ${config.max} minutes`;
}

export function generateWaitTimePhrase(
  status: KitchenStatus,
  settings: StatusSettings | null
): string {
  if (status === "STOP") {
    return settings?.STOP?.message || "Nous ne prenons plus de commandes pour le moment";
  }

  const delayConfig = settings?.[status];
  if (!delayConfig) {
    return formatDelayPhrase(DEFAULT_WAIT_TIMES[status]);
  }

  return formatDelayPhrase(delayConfig);
}

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

