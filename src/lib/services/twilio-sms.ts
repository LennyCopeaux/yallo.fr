import { logger } from "@/lib/logger";
import { normalizeFrenchPhoneNumber } from "@/lib/utils";

export async function sendTwilioSms(sms: Readonly<{ toE164: string; fromE164: string; body: string }>): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const apiKey = process.env.TWILIO_API_KEY?.trim();
  const apiSecret = process.env.TWILIO_API_SECRET?.trim();

  if (!accountSid || !apiKey || !apiSecret) {
    throw new Error("Twilio non configuré (TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET)");
  }

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`;

  const form = new URLSearchParams();
  form.set("To", sms.toE164);
  form.set("From", sms.fromE164);
  form.set("Body", sms.body);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Twilio SMS ${response.status}: ${errText.slice(0, 200)}`);
  }
}

export function buildOrderConfirmationSmsBody(params: Readonly<{
  restaurantName: string;
  orderNumber: string;
  lines: string[];
  totalEuros: string;
  customerName?: string | null;
  pickupTime?: string | null;
  notes?: string | null;
}>): string {
  const lines = [
    "Commande confirmée",
    params.restaurantName,
    `Commande n° ${params.orderNumber}`,
    "",
    ...params.lines,
    "",
    `Total : ${params.totalEuros} €`,
  ];

  if (params.pickupTime) {
    lines.push(`Retrait : ${params.pickupTime}`);
  }
  if (params.customerName) {
    lines.push(`Au nom de : ${params.customerName}`);
  }
  if (params.notes) {
    lines.push(`Note : ${params.notes}`);
  }

  lines.push("", "Merci de votre commande !");

  return lines.join("\n");
}

export async function trySendOrderConfirmationSms(options: Readonly<{
  toRaw: string | undefined | null;
  fromRaw: string | undefined | null;
  restaurantName: string;
  orderNumber: string;
  lines: string[];
  totalEuros: string;
  customerName?: string | null;
  pickupTime?: string | null;
  notes?: string | null;
}>): Promise<void> {
  if (!options.toRaw?.trim() || !options.fromRaw?.trim()) {
    return;
  }

  const toE164 = normalizeFrenchPhoneNumber(options.toRaw.trim());
  const fromE164 = normalizeFrenchPhoneNumber(options.fromRaw.trim());
  if (!toE164 || !fromE164) {
    logger.warn("SMS confirmation ignoré : numéros non normalisables", {
      to: options.toRaw,
      from: options.fromRaw,
    });
    return;
  }

  const body = buildOrderConfirmationSmsBody({
    restaurantName: options.restaurantName,
    orderNumber: options.orderNumber,
    lines: options.lines,
    totalEuros: options.totalEuros,
    customerName: options.customerName,
    pickupTime: options.pickupTime,
    notes: options.notes,
  });

  try {
    await sendTwilioSms({ toE164, fromE164, body });
    logger.info("SMS de confirmation envoyé", { to: toE164, orderNumber: options.orderNumber });
  } catch (error) {
    logger.error(
      "Échec envoi SMS confirmation (commande déjà enregistrée)",
      error instanceof Error ? error : new Error(String(error)),
      { to: toE164, orderNumber: options.orderNumber }
    );
  }
}

export function buildOrderReadySmsBody(params: Readonly<{
  restaurantName: string;
  orderNumber: string;
  customerName?: string | null;
}>): string {
  const greeting = params.customerName?.trim()
    ? `${params.customerName.trim()}, votre commande`
    : "Votre commande";

  return [
    `${greeting} ${params.orderNumber} est prête.`,
    `Vous pouvez venir la récupérer chez ${params.restaurantName}.`,
  ].join("\n");
}

export async function trySendOrderReadySms(options: Readonly<{
  toRaw: string | undefined | null;
  fromRaw: string | undefined | null;
  restaurantName: string;
  orderNumber: string;
  customerName?: string | null;
}>): Promise<boolean> {
  if (!options.toRaw?.trim() || !options.fromRaw?.trim()) {
    return false;
  }

  const toE164 = normalizeFrenchPhoneNumber(options.toRaw.trim());
  const fromE164 = normalizeFrenchPhoneNumber(options.fromRaw.trim());
  if (!toE164 || !fromE164) {
    logger.warn("SMS commande prête ignoré : numéros non normalisables", {
      to: options.toRaw,
      from: options.fromRaw,
    });
    return false;
  }

  const body = buildOrderReadySmsBody({
    restaurantName: options.restaurantName,
    orderNumber: options.orderNumber,
    customerName: options.customerName,
  });

  try {
    await sendTwilioSms({ toE164, fromE164, body });
    logger.info("SMS commande prête envoyé", { to: toE164, orderNumber: options.orderNumber });
    return true;
  } catch (error) {
    logger.error(
      "Échec envoi SMS commande prête",
      error instanceof Error ? error : new Error(String(error)),
      { to: toE164, orderNumber: options.orderNumber }
    );
    return false;
  }
}
