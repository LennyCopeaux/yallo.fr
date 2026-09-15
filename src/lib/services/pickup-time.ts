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

const PARIS_TIME_ZONE = "Europe/Paris";

/**
 * Décalage (en minutes) entre l'heure de Paris et l'UTC à un instant donné :
 * +60 en hiver, +120 en été. Calculé via Intl pour ne pas dépendre du fuseau
 * du serveur (Vercel tourne en UTC, le poste de dev en heure de Paris).
 */
function getParisOffsetMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const read = (type: string): number => Number(parts.find((p) => p.type === type)?.value ?? "0");
  const asUtc = Date.UTC(
    read("year"),
    read("month") - 1,
    read("day"),
    read("hour") % 24,
    read("minute"),
    read("second")
  );

  return Math.round((asUtc - date.getTime()) / 60_000);
}

/** Composantes de la date civile à Paris. */
function getParisDateParts(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const read = (type: string): number => Number(parts.find((p) => p.type === type)?.value ?? "0");
  return { year: read("year"), month: read("month"), day: read("day") };
}

/**
 * Convertit une heure civile de Paris (année, mois, jour, heure, minute) en
 * instant absolu. Deux passes pour absorber les changements d'heure.
 */
function parisLocalToDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const firstGuess = new Date(naive - getParisOffsetMinutes(new Date(naive)) * 60_000);
  const offset = getParisOffsetMinutes(firstGuess);
  return new Date(naive - offset * 60_000);
}

/**
 * Heure de retrait « HH:MM » donnée par l'assistant, interprétée comme une
 * heure de Paris — c'est celle que le client a entendue et validée.
 *
 * L'ancienne version faisait `setHours()` sur le fuseau du serveur : sur
 * Vercel (UTC), « 19:30 » devenait 19h30 UTC, soit 21h30 à Paris sur la
 * tablette cuisine, alors que le SMS (formaté lui aussi en UTC) disait 19h30.
 *
 * Si l'heure est déjà passée à Paris, on bascule au lendemain.
 */
export function parsePickupTimeInParis(pickupTimeStr: string | undefined, now: Date = new Date()): Date | null {
  if (!pickupTimeStr) return null;

  const match = /^(\d{1,2}):(\d{2})$/.exec(pickupTimeStr.trim());
  if (!match) return null;

  const hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  if (hour > 23 || minute > 59) return null;

  const { year, month, day } = getParisDateParts(now);
  let pickup = parisLocalToDate(year, month, day, hour, minute);

  if (pickup.getTime() < now.getTime()) {
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60_000);
    const next = getParisDateParts(tomorrow);
    pickup = parisLocalToDate(next.year, next.month, next.day, hour, minute);
  }

  return pickup;
}

/** « HH:MM » en heure de Paris, pour le SMS, le dashboard et les retours à l'assistant. */
export function formatParisTime(date: Date): string {
  const { hour, minute } = getParisHourMinute(date);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Heure locale à Paris, indépendamment du fuseau du serveur. */
function getParisHourMinute(date: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS_TIME_ZONE,
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

const UNITS = ["", "une", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
const TEENS = [
  "dix",
  "onze",
  "douze",
  "treize",
  "quatorze",
  "quinze",
  "seize",
  "dix-sept",
  "dix-huit",
  "dix-neuf",
];
const TENS = ["", "", "vingt", "trente", "quarante", "cinquante"];

/** 1 → 59, pour les minutes (et les heures 13–23). */
export function numberToFrench(value: number): string {
  if (value < 1 || value > 59) return String(value);
  if (value < 10) return UNITS[value];
  if (value < 20) return TEENS[value - 10];

  const ten = Math.floor(value / 10);
  const unit = value % 10;
  if (unit === 0) return TENS[ten];
  if (unit === 1) return `${TENS[ten]}-et-une`;
  return `${TENS[ten]}-${UNITS[unit]}`;
}

/**
 * Heure à lire à voix haute. Les chiffres (« 19h05 », « 19 heures 5 ») font
 * basculer ElevenLabs sur « 19 euros 5 ». On n'envoie donc que des lettres.
 */
export function formatSpokenFrenchTime(hhmm: string): string {
  const [hourRaw, minuteRaw] = hhmm.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return hhmm;

  const hourPart =
    hour === 0 ? "minuit" : hour === 12 ? "midi" : hour === 1 ? "une heure" : `${numberToFrench(hour)} heures`;

  if (minute === 0) return hourPart;
  if (hour === 0 || hour === 12) return `${hourPart} ${numberToFrench(minute)}`;
  return `${hourPart} ${numberToFrench(minute)}`;
}
