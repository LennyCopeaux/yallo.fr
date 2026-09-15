import { generateSystemPrompt } from "./system-prompt";
import type { restaurants } from "@/db/schema";
import { logger } from "@/lib/logger";
import { normalizeFrenchPhoneNumber } from "@/lib/utils";
import {
  resolveAssistantFirstMessage,
  resolveCallOrderAvailability,
  type CallOrderAvailability,
} from "./business-hours";

type Restaurant = typeof restaurants.$inferSelect;

const VAPI_API_URL = "https://api.vapi.ai";

/**
 * gpt-4o-mini ne tenait pas les consignes de dialogue (récapitulatifs répétés,
 * heures en chiffres, taille inventée quand le mot n'a pas été transcrit).
 * gpt-4o coûte un peu de latence mais suit un déroulé en neuf étapes.
 */
const DEFAULT_LLM_MODEL = "gpt-4o";

const DEFAULT_LLM_TEMPERATURE = 0.3;

/**
 * Flash v2.5 = latence minimale ; multilingual v2 = français nettement plus
 * naturel (liaisons, heures) au prix d'environ 300 ms de plus par phrase.
 */
const DEFAULT_VOICE_MODEL = "eleven_flash_v2_5";

/**
 * Stabilité 0.8 donnait une voix monocorde et hachée. 0.5 laisse la voix
 * moduler les phrases ; similarityBoost reste élevé pour garder le timbre.
 */
const DEFAULT_VOICE_STABILITY = 0.5;
const DEFAULT_VOICE_SIMILARITY = 0.75;

/** Bruit de fond « office » : un appel vers un restaurant ne sonne pas comme un studio. */
const BACKGROUND_SOUND = "office";

const DEFAULT_TRANSCRIBER_PROVIDER = "deepgram";
const DEFAULT_TRANSCRIBER_MODEL = "nova-3";

/**
 * 1.05 = débit d'un employé de comptoir, légèrement vif. Au-delà de 1.1,
 * ElevenLabs accélère les phonèmes français jusqu'à basculer sur un accent /
 * une langue illisibles (« Normallow grunge »).
 */
const DEFAULT_VOICE_SPEED = 1.05;

const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

function getApiKey(): string {
  const apiKey = process.env.VAPI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("VAPI_API_KEY n'est pas configurée dans les variables d'environnement");
  }
  return apiKey;
}

function getWebhookBaseUrl(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit?.startsWith("http://") || explicit?.startsWith("https://")) {
    return explicit.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }
  const authUrl = process.env.AUTH_URL?.trim();
  if (authUrl?.startsWith("http://") || authUrl?.startsWith("https://")) {
    return authUrl.replace(/\/$/, "");
  }
  return undefined;
}

function getWebhookUrl(restaurantId: string): string | undefined {
  const base = getWebhookBaseUrl();
  if (!base) return undefined;
  const isLocalHttp = base.startsWith("http://") && process.env.NODE_ENV !== "production";
  if (base.startsWith("https://") || isLocalHttp) {
    return `${base}/api/vapi/webhook?rid=${restaurantId}`;
  }
  return undefined;
}

function buildVapiName(label: string): string {
  const full = `Yallo - ${label}`.trim();
  return full.length <= 40 ? full : full.slice(0, 40).trim();
}

function getWebhookSecret(): string | undefined {
  const s = process.env.VAPI_WEBHOOK_SECRET?.trim();
  return s && s.length > 0 ? s : undefined;
}

function buildSubmitOrderTool(webhookUrl?: string) {
  const secret = getWebhookSecret();

  return {
    type: "function",
    function: {
      name: "submit_order",
      description:
        "Soumet la commande en fin d'appel uniquement : articles complets, mode (sur place / emporter / livraison) si pertinent, puis prénom obtenu. Ne pas appeler avant d'avoir le prénom demandé pour la commande.",
      parameters: {
        type: "object",
        properties: {
          customer_name: {
            type: "string",
            description:
              "Prénom ou nom tel que le client vient de le donner pour cette commande (pas d'invention, pas de confusion avec d'autres mots)",
          },
          customer_phone: {
            type: "string",
            description:
              "Numéro du client si connu (sinon vide ; le numéro d'appel peut être complété côté serveur)",
          },
          items: {
            type: "array",
            description: "La liste des articles commandés",
            items: {
              type: "object",
              properties: {
                product_name: {
                  type: "string",
                  description: "Le nom du produit commandé",
                },
                quantity: {
                  type: "number",
                  description:
                    "Quantité (entier ≥ 1). Si le client dit « une X » / « un X » sans chiffre, mettre 1",
                },
                unit_price: {
                  type: "number",
                  description: "Le prix unitaire en euros",
                },
                options: {
                  type: "string",
                  description: "Les options choisies (sauce, viande, cuisson, taille, etc.)",
                },
              },
              required: ["product_name", "quantity", "unit_price"],
            },
          },
          pickup_time: {
            type: "string",
            description:
              "L'heure de retrait souhaitée par le client (format HH:MM), obligatoire",
          },
          notes: {
            type: "string",
            description:
              "Notes, allergènes, ou précisions (ex. sur place / à emporter / livraison si non couvert ailleurs)",
          },
        },
        required: ["customer_name", "items", "pickup_time"],
      },
    },
    // Sans ce message, VAPI invente un filler anglais du type « Hold on a sec »,
    // traduit à l'oral par « Attends une seconde » — tutoiement interdit.
    messages: [
      {
        type: "request-start",
        content: "Un instant.",
      },
    ],
    ...(webhookUrl
      ? {
          server: {
            url: webhookUrl,
            ...(secret ? { secret } : {}),
          },
        }
      : {}),
  };
}

function buildTransferCallTool(phoneNumber: string) {
  return {
    type: "transferCall",
    destinations: [
      {
        type: "number",
        number: phoneNumber,
        message:
          "Je vous mets en relation avec l'équipe, un instant.",
        description:
          "Si le client demande explicitement à parler à un responsable, au patron, au gérant ou à un humain.",
      },
    ],
  };
}

function buildAnalysisPlan() {
  return {
    structuredDataPlan: {
      enabled: true,
      schema: {
        type: "object",
        properties: {
          customer_name: {
            type: "string",
            description: "Prénom ou nom donné par le client",
          },
          customer_phone: {
            type: "string",
            description: "Numéro de téléphone du client s'il l'a mentionné, sinon null",
          },
          items_summary: {
            type: "string",
            description: "Liste ou résumé des produits commandés avec options",
          },
          estimated_total_eur: {
            type: "number",
            description: "Total estimé en euros si mentionné, null si non précisé",
          },
          pickup_time: {
            type: "string",
            description: "Heure de retrait (HH:MM), null si non précisé",
          },
          asap: {
            type: "boolean",
            description: "True si le client veut le plus tôt possible",
          },
          order_confirmed: {
            type: "boolean",
            description: "True si la commande a été enregistrée (tool submit_order OK)",
          },
          outcome: {
            type: "string",
            description:
              "Résultat principal de l'appel : order_placed, abandoned, transferred, error, ou unknown",
          },
          short_summary: {
            type: "string",
            description: "Résumé de l'appel en une ou deux phrases",
          },
          sentiment: {
            type: "string",
            description: "Sentiment perçu : positive, neutral, ou negative",
          },
        },
        required: ["outcome"],
      },
    },
  };
}

function parseFloatEnv(name: string, fallback: number): number {
  const parsed = Number.parseFloat(process.env[name]?.trim() ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Noms de la carte et mots de taille, pour orienter la transcription.
 * Le client dit « la 4 fromages en petite » : sans indice, Deepgram rend
 * « la carte fromage en thaï », et le modèle invente une taille.
 */
export function collectTranscriberKeyterms(menu: unknown): string[] {
  const terms = new Set<string>(["petite", "moyenne", "grande", "à emporter", "sur place"]);
  if (menu === null || typeof menu !== "object") return [...terms];
  const record = menu as Record<string, unknown>;

  const addName = (raw: unknown) => {
    if (typeof raw !== "string") return;
    const name = raw.replace(/\s*\(.*?\)\s*/g, " ").trim();
    if (name.length >= 3 && terms.size < 100) terms.add(name);
  };

  if (Array.isArray(record.donnees_menu)) {
    for (const section of record.donnees_menu as Array<{ articles?: unknown }>) {
      if (!Array.isArray(section?.articles)) continue;
      for (const article of section.articles as Array<{ nom?: unknown }>) addName(article?.nom);
    }
  }
  if (Array.isArray(record.categories)) {
    for (const category of record.categories as Array<{ products?: unknown }>) {
      if (!Array.isArray(category?.products)) continue;
      for (const product of category.products as Array<{ name?: unknown }>) addName(product?.name);
    }
  }
  return [...terms];
}

function buildTranscriber(restaurant: Restaurant) {
  const provider = process.env.VAPI_TRANSCRIBER_PROVIDER?.trim() || DEFAULT_TRANSCRIBER_PROVIDER;
  const model = process.env.VAPI_TRANSCRIBER_MODEL?.trim() || DEFAULT_TRANSCRIBER_MODEL;
  const useKeyterms =
    provider === "deepgram" && process.env.VAPI_TRANSCRIBER_KEYTERMS?.trim().toLowerCase() === "true";

  return {
    provider,
    model,
    language: "fr",
    ...(useKeyterms ? { keyterm: collectTranscriberKeyterms(restaurant.menuData) } : {}),
  };
}

function buildAssistantConfig(
  restaurant: Restaurant,
  systemPrompt: string,
  options?: { availability?: CallOrderAvailability }
) {
  const webhookUrl = getWebhookUrl(restaurant.id);
  const webhookSecret = getWebhookSecret();
  const voiceId = restaurant.voiceId?.trim() || process.env.VAPI_VOICE_ID?.trim() || DEFAULT_VOICE_ID;
  const llmModel = process.env.VAPI_LLM_MODEL?.trim() || DEFAULT_LLM_MODEL;
  const llmTemperature =
    Number.parseFloat(process.env.VAPI_LLM_TEMPERATURE?.trim() ?? "") ||
    DEFAULT_LLM_TEMPERATURE;

  // Live calls pass availability; static create/update keep ordering enabled
  // (real open/closed is applied on assistant-request).
  const availability = options?.availability ?? {
    canTakeOrders: true,
    reason: "open" as const,
    hoursState: resolveCallOrderAvailability(restaurant).hoursState,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools: any[] = [];

  // Hard block at call start: no submit_order tool when closed / STOP
  if (availability.canTakeOrders) {
    tools.push(buildSubmitOrderTool(webhookUrl));
  }

  if (restaurant.callForwardingEnabled && restaurant.phoneNumber?.trim()) {
    const transferPhoneNumber = normalizeFrenchPhoneNumber(restaurant.phoneNumber.trim());
    if (transferPhoneNumber) {
      tools.push(buildTransferCallTool(transferPhoneNumber));
    }
  }

  return {
    name: buildVapiName(restaurant.name),
    model: {
      provider: "openai",
      model: llmModel,
      temperature: llmTemperature,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
      ],
      tools,
    },
    voice: {
      provider: "11labs",
      voiceId,
      // Flash v2.5 et multilingual v2 acceptent le verrou de langue.
      // Turbo, plus rapide, interprète souvent un fragment français comme de l'anglais.
      model: process.env.VAPI_VOICE_MODEL?.trim() || DEFAULT_VOICE_MODEL,
      language: "fr",
      speed: DEFAULT_VOICE_SPEED,
      stability: parseFloatEnv("VAPI_VOICE_STABILITY", DEFAULT_VOICE_STABILITY),
      similarityBoost: parseFloatEnv("VAPI_VOICE_SIMILARITY", DEFAULT_VOICE_SIMILARITY),
      optimizeStreamingLatency: 3,
    },
    backgroundSound: BACKGROUND_SOUND,
    transcriber: buildTranscriber(restaurant),
    firstMessage: resolveAssistantFirstMessage(restaurant, availability),
    analysisPlan: buildAnalysisPlan(),

    ...(webhookUrl
      ? {
          server: {
            url: webhookUrl,
            ...(webhookSecret ? { secret: webhookSecret } : {}),
          },
        }
      : {}),
  };
}

export async function buildAssistantPayloadForCall(restaurant: Restaurant) {
  const availability = resolveCallOrderAvailability(restaurant);
  const systemPrompt = await generateSystemPrompt(restaurant, {
    includeCurrentTime: true,
    availability,
  });
  return buildAssistantConfig(restaurant, systemPrompt, { availability });
}

export async function createVapiAssistant(restaurant: Restaurant): Promise<{ id: string }> {
  const apiKey = getApiKey();
  const systemPrompt = await generateSystemPrompt(restaurant);
  const config = buildAssistantConfig(restaurant, systemPrompt);

  const response = await fetch(`${VAPI_API_URL}/assistant`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = typeof body === "object" && body !== null
      ? ((body as Record<string, unknown>).message as string | undefined) ?? JSON.stringify(body)
      : `Erreur VAPI API: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json() as { id: string };
  return { id: data.id };
}

export async function updateVapiAssistant(
  assistantId: string,
  restaurant: Restaurant
): Promise<void> {
  const apiKey = getApiKey();
  const systemPrompt = await generateSystemPrompt(restaurant);
  const config = buildAssistantConfig(restaurant, systemPrompt);

  const response = await fetch(`${VAPI_API_URL}/assistant/${assistantId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = typeof body === "object" && body !== null
      ? ((body as Record<string, unknown>).message as string | undefined) ?? JSON.stringify(body)
      : `Erreur VAPI API: ${response.status}`;
    throw new Error(message);
  }
}

export async function deleteVapiAssistant(assistantId: string): Promise<void> {
  const apiKey = getApiKey();

  const response = await fetch(`${VAPI_API_URL}/assistant/${assistantId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = typeof body === "object" && body !== null
      ? ((body as Record<string, unknown>).message as string | undefined) ?? JSON.stringify(body)
      : `Erreur VAPI API: ${response.status}`;
    throw new Error(message);
  }
}

export async function importTwilioPhoneNumber(
  phoneNumber: string,
  restaurantId: string
): Promise<{ phone_number_id: string }> {
  const apiKey = getApiKey();
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

  if (!twilioAccountSid || !twilioAuthToken) {
    throw new Error(
      "Les identifiants Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) ne sont pas configurés"
    );
  }

  const normalizedNumber = normalizeFrenchPhoneNumber(phoneNumber);
  if (!normalizedNumber) {
    throw new Error(
      `Format de numéro invalide : "${phoneNumber}". Utilisez le format +33XXXXXXXXX (ex: +33939035299) ou 0XXXXXXXXX (ex: 0939035299)`
    );
  }

  const webhookUrl = getWebhookUrl(restaurantId);
  const webhookSecret = getWebhookSecret();

  const response = await fetch(`${VAPI_API_URL}/phone-number`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      provider: "twilio",
      number: normalizedNumber,
      twilioAccountSid,
      twilioAuthToken,
      name: buildVapiName(phoneNumber),
      ...(webhookUrl
        ? {
            server: {
              url: webhookUrl,
              ...(webhookSecret ? { secret: webhookSecret } : {}),
            },
          }
        : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = typeof body === "object" && body !== null
      ? ((body as Record<string, unknown>).message as string | undefined) ?? JSON.stringify(body)
      : `Erreur VAPI API: ${response.status}`;
    logger.error("Erreur import numéro Twilio dans VAPI", new Error(message));
    throw new Error(message);
  }

  const data = await response.json() as { id: string };
  return { phone_number_id: data.id };
}

export async function updateVapiPhoneNumberServer(
  phoneNumberId: string,
  restaurantId: string
): Promise<void> {
  const apiKey = getApiKey();
  const webhookUrl = getWebhookUrl(restaurantId);
  const webhookSecret = getWebhookSecret();

  if (!webhookUrl) {
    throw new Error("Impossible de construire le webhook URL (NEXT_PUBLIC_APP_URL non configuré)");
  }

  const response = await fetch(`${VAPI_API_URL}/phone-number/${phoneNumberId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assistantId: null,
      server: {
        url: webhookUrl,
        ...(webhookSecret ? { secret: webhookSecret } : {}),
      },
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = typeof body === "object" && body !== null
      ? ((body as Record<string, unknown>).message as string | undefined) ?? JSON.stringify(body)
      : `Erreur VAPI API: ${response.status}`;
    throw new Error(message);
  }
}

export async function deleteVapiPhoneNumber(phoneNumberId: string): Promise<void> {
  const apiKey = getApiKey();

  const response = await fetch(`${VAPI_API_URL}/phone-number/${phoneNumberId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = typeof body === "object" && body !== null
      ? ((body as Record<string, unknown>).message as string | undefined) ?? JSON.stringify(body)
      : `Erreur VAPI API: ${response.status}`;
    throw new Error(message);
  }
}
