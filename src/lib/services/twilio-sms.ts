import { logger } from "@/lib/logger";
import { normalizeFrenchPhoneNumber } from "@/lib/utils";

/**
 * Envoie un SMS via l’API Twilio (auth API Key + Secret).
 * @see https://www.twilio.com/docs/sms/api/message-resource
 */
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

/**
 * Construit le texte du récap SMS (court).
 */
export function buildOrderConfirmationSmsBody(params: Readonly<{
  restaurantName: string;
  orderNumber: string;
  lines: string[];
  totalEuros: string;
}>): string {
  const header = `${params.restaurantName} — ${params.orderNumber}`;
  const detail = params.lines.join("\n");
  return `${header}\n${detail}\nTotal : ${params.totalEuros} €\nMerci !`;
}

/**
 * Tente d’envoyer le SMS de confirmation ; échec silencieux côté client (log seulement).
 */
export async function trySendOrderConfirmationSms(options: Readonly<{
  toRaw: string | undefined | null;
  fromRaw: string | undefined | null;
  restaurantName: string;
  orderNumber: string;
  lines: string[];
  totalEuros: string;
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
