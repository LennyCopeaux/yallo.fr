type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type SingleSlot = {
  open: string;
  close: string;
};

type DualSlot = {
  lunch: SingleSlot;
  dinner: SingleSlot;
};

type DaySchedule = SingleSlot | DualSlot;

type BusinessHoursShape = {
  timezone?: string;
  schedule?: Partial<Record<DayKey, DaySchedule>>;
};

export type BusinessHoursOpenState = {
  isConfigured: boolean;
  isOpen: boolean;
  dayKey: DayKey;
  currentTime: string;
  timeZone: string;
};

/** Availability for taking phone orders (subscription + hours + kitchen STOP). */
export type CallOrderAvailability = {
  canTakeOrders: boolean;
  /** Why orders are blocked, or why they are allowed despite missing hours. */
  reason: "open" | "closed_hours" | "stop" | "hours_unconfigured" | "suspended";
  hoursState: BusinessHoursOpenState;
};

type CallAvailabilityRestaurant = {
  name: string;
  businessHours: string | null;
  currentStatus: "CALM" | "NORMAL" | "RUSH" | "STOP";
  statusSettings?: {
    STOP?: { message?: string };
  } | null;
  welcomeMessage?: string | null;
  /** Desactive quand l'abonnement Stripe n'est plus actif (webhook Stripe). */
  isActive?: boolean | null;
  status?: "active" | "suspended" | "onboarding" | null;
};

const DAY_KEYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const FR_DAY_LABELS: Record<DayKey, string> = {
  monday: "lundi",
  tuesday: "mardi",
  wednesday: "mercredi",
  thursday: "jeudi",
  friday: "vendredi",
  saturday: "samedi",
  sunday: "dimanche",
};

function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function isMinuteInSlot(currentMinutes: number, slot: SingleSlot): boolean {
  const openMinutes = parseTimeToMinutes(slot.open);
  const closeMinutes = parseTimeToMinutes(slot.close);

  if (openMinutes === null || closeMinutes === null) return false;

  if (openMinutes < closeMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
}

function isDualSlot(value: DaySchedule): value is DualSlot {
  return "lunch" in value && "dinner" in value;
}

function extractParisDayAndMinutes(now: Date): { dayKey: DayKey; currentTime: string; minutes: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const weekdayRaw = parts.find((p) => p.type === "weekday")?.value.toLowerCase() ?? "monday";
  const hourRaw = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minuteRaw = parts.find((p) => p.type === "minute")?.value ?? "00";

  const dayKey = DAY_KEYS.includes(weekdayRaw as DayKey) ? (weekdayRaw as DayKey) : "monday";
  const hours = Number.parseInt(hourRaw, 10);
  const minutes = Number.parseInt(minuteRaw, 10);

  return {
    dayKey,
    currentTime: `${hourRaw}:${minuteRaw}`,
    minutes: hours * 60 + minutes,
  };
}

export function getBusinessHoursOpenState(
  businessHoursRaw: string | null | undefined,
  now: Date = new Date()
): BusinessHoursOpenState {
  const { dayKey, currentTime, minutes } = extractParisDayAndMinutes(now);

  if (!businessHoursRaw) {
    return {
      isConfigured: false,
      isOpen: true,
      dayKey,
      currentTime,
      timeZone: "Europe/Paris",
    };
  }

  let parsed: BusinessHoursShape;
  try {
    parsed = JSON.parse(businessHoursRaw) as BusinessHoursShape;
  } catch {
    return {
      isConfigured: false,
      isOpen: true,
      dayKey,
      currentTime,
      timeZone: "Europe/Paris",
    };
  }

  const schedule = parsed.schedule;
  if (!schedule || typeof schedule !== "object") {
    return {
      isConfigured: false,
      isOpen: true,
      dayKey,
      currentTime,
      timeZone: parsed.timezone || "Europe/Paris",
    };
  }

  const today = schedule[dayKey];
  if (!today) {
    return {
      isConfigured: true,
      isOpen: false,
      dayKey,
      currentTime,
      timeZone: parsed.timezone || "Europe/Paris",
    };
  }

  const isOpen = isDualSlot(today)
    ? isMinuteInSlot(minutes, today.lunch) || isMinuteInSlot(minutes, today.dinner)
    : isMinuteInSlot(minutes, today);

  return {
    isConfigured: true,
    isOpen,
    dayKey,
    currentTime,
    timeZone: parsed.timezone || "Europe/Paris",
  };
}

export function buildHoursStatusLineForPrompt(
  businessHoursRaw: string | null | undefined,
  now: Date = new Date()
): string {
  const state = getBusinessHoursOpenState(businessHoursRaw, now);

  if (!state.isConfigured) {
    return "Statut d'ouverture calculé en temps réel : NON_CONFIGURE (horaires absents ou invalides). Dans ce cas, tu PEUX prendre les commandes. Ne dis JAMAIS que le restaurant est fermé pour cause d'horaires.";
  }

  const openLabel = state.isOpen ? "OUVERT" : "FERME";
  return `Statut d'ouverture calculé en temps réel : ${openLabel} (jour: ${FR_DAY_LABELS[state.dayKey]}, heure: ${state.currentTime}, fuseau: ${state.timeZone}).`;
}

/**
 * Resolves whether the voice agent may take orders right now.
 * - A suspended restaurant (abonnement inactif) always blocks.
 * - STOP kitchen status always blocks.
 * - Configured hours that are closed block.
 * - Missing / invalid hours do NOT block (fail-open) so restaurants without a schedule still work.
 */
export function resolveCallOrderAvailability(
  restaurant: CallAvailabilityRestaurant,
  now: Date = new Date()
): CallOrderAvailability {
  const hoursState = getBusinessHoursOpenState(restaurant.businessHours, now);

  if (restaurant.isActive === false || restaurant.status === "suspended") {
    return { canTakeOrders: false, reason: "suspended", hoursState };
  }

  if (restaurant.currentStatus === "STOP") {
    return { canTakeOrders: false, reason: "stop", hoursState };
  }

  if (!hoursState.isConfigured) {
    return { canTakeOrders: true, reason: "hours_unconfigured", hoursState };
  }

  if (!hoursState.isOpen) {
    return { canTakeOrders: false, reason: "closed_hours", hoursState };
  }

  return { canTakeOrders: true, reason: "open", hoursState };
}

export function buildClosedFirstMessage(
  restaurant: CallAvailabilityRestaurant,
  availability: CallOrderAvailability
): string {
  if (availability.reason === "suspended") {
    return `Bonjour, ici ${restaurant.name}. La prise de commande automatique est momentanément indisponible. Merci de rappeler plus tard. Au revoir.`;
  }

  if (availability.reason === "stop") {
    const stopMessage =
      restaurant.statusSettings?.STOP?.message?.trim() ||
      "Nous sommes actuellement fermés et ne prenons plus de commandes.";
    return `Bonjour, ici ${restaurant.name}. ${stopMessage}`;
  }

  return `Bonjour, ici ${restaurant.name}. Nous sommes actuellement fermés selon nos horaires d'ouverture et ne pouvons pas prendre de commande pour le moment. Merci de rappeler pendant nos heures d'ouverture. Au revoir.`;
}

export function resolveAssistantFirstMessage(
  restaurant: CallAvailabilityRestaurant,
  availability: CallOrderAvailability
): string {
  if (!availability.canTakeOrders) {
    return buildClosedFirstMessage(restaurant, availability);
  }

  return restaurant.welcomeMessage?.trim() || `Bonjour ici ${restaurant.name}, je vous écoute`;
}
