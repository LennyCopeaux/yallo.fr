import type { restaurants } from "@/db/schema";

type Restaurant = typeof restaurants.$inferSelect;
type StatusSettings = NonNullable<Restaurant["statusSettings"]>;
type DelaySetting = NonNullable<StatusSettings["CALM"]>;

/**
 * Heure de retrait proposée par l'assistant.
 *
 * L'assistant demandait « à quelle heure souhaitez-vous venir ? », ce qui
 * transfère au client une décision qu'il ne peut pas prendre : il ne connaît ni
 * la charge de la cuisine ni le temps de préparation. On calcule donc ici la
 * première heure tenable, à partir du délai configuré pour le statut cuisine
 * courant, et l'assistant la propose.
 *
 * Le calcul est fait côté serveur parce qu'un LLM se trompe régulièrement sur
 * l'arithmétique des heures, surtout au passage d'heure.
 */

/** Utilisé quand aucun délai n'est configuré pour le statut courant. */
export const DEFAULT_PREP_MINUTES = 20;

/** Les heures « rondes » sonnent juste au téléphone : 19h15, pas 19h13. */
const ROUNDING_MINUTES = 5;

/**
 * Sur une fourchette (« entre 25 et 35 minutes »), on retient la borne basse :
 * c'est la première heure tenable. Le client peut ensuite en demander une plus
 * tard ; on refuse seulement une heure plus tôt.
 */
function extractMinutes(setting: DelaySetting | undefined): number | null {
  if (!setting) return null;
  if ("fixed" in setting) {
    return Number.isFinite(setting.fixed) && setting.fixed > 0 ? setting.fixed : null;
  }
  if (Number.isFinite(setting.min) && setting.min > 0) return setting.min;
  return Number.isFinite(setting.max) && setting.max > 0 ? setting.max : null;
}

export function resolvePrepMinutes(
  statusSettings: Restaurant["statusSettings"],
  currentStatus: Restaurant["currentStatus"]
): number {
  if (currentStatus === "STOP") return DEFAULT_PREP_MINUTES;

  const setting = statusSettings?.[currentStatus] as DelaySetting | undefined;
  return extractMinutes(setting) ?? DEFAULT_PREP_MINUTES;
}

/** Heure locale à Paris, indépendamment du fuseau du serveur. */
function getParisHourMinute(date: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");

  // Intl peut rendre « 24 » à minuit selon l'environnement.
  return { hour: hour % 24, minute };
}

/**
 * Renvoie l'heure de retrait à proposer, au format HH:MM (heure de Paris).
 */
export function computeSuggestedPickupTime(now: Date, prepMinutes: number): string {
  const target = new Date(now.getTime() + prepMinutes * 60_000);
  const { hour, minute } = getParisHourMinute(target);

  const roundedMinute = Math.ceil(minute / ROUNDING_MINUTES) * ROUNDING_MINUTES;
  const carryHours = Math.floor(roundedMinute / 60);

  const finalHour = (hour + carryHours) % 24;
  const finalMinute = roundedMinute % 60;

  return `${String(finalHour).padStart(2, "0")}:${String(finalMinute).padStart(2, "0")}`;
}
