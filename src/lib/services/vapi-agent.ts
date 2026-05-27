import { generateSystemPrompt } from "./system-prompt";
import type { restaurants } from "@/db/schema";
import { logger } from "@/lib/logger";
import { normalizeFrenchPhoneNumber } from "@/lib/utils";

type Restaurant = typeof restaurants.$inferSelect;

const VAPI_API_URL = "https://api.vapi.ai";

/** Modèle LLM utilisé par l'assistant VAPI. */
const DEFAULT_LLM_MODEL = "gpt-4o-mini";

/** Température LLM. */
const DEFAULT_LLM_TEMPERATURE = 0.4;

/** Voix ElevenLabs (via VAPI) par défaut. Surcharge via VAPI_VOICE_ID. */
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

function getWebhookSecret(): string | undefined {
  const s = process.env.VAPI_WEBHOOK_SECRET?.trim();
  return s && s.length > 0 ? s : undefined;
}

/**
 * Construit le tool VAPI de type "function" pour la soumission de commandes.
 * https://docs.vapi.ai/tools/custom-tools
 */
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
              "L'heure de retrait souhaitée par le client (format HH:MM), ou vide si le client n'a pas précisé",
          },
          notes: {
            type: "string",
            description:
              "Notes, allergènes, ou précisions (ex. sur place / à emporter / livraison si non couvert ailleurs)",
          },
        },
        required: ["customer_name", "items"],
      },
    },
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

/**
 * Construit le tool VAPI natif de transfert d'appel.
 * https://docs.vapi.ai/tools/transfer-call
 */
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

/**
 * Construit le plan d'analyse structurée post-appel (remplace ElevenLabs data collection).
 */
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

function buildAssistantConfig(restaurant: Restaurant, systemPrompt: string) {
  const webhookUrl = getWebhookUrl(restaurant.id);
  const webhookSecret = getWebhookSecret();
  const voiceId = restaurant.voiceId?.trim() || process.env.VAPI_VOICE_ID?.trim() || DEFAULT_VOICE_ID;
  const llmModel = process.env.VAPI_LLM_MODEL?.trim() || DEFAULT_LLM_MODEL;
  const llmTemperature =
    Number.parseFloat(process.env.VAPI_LLM_TEMPERATURE?.trim() ?? "") ||
    DEFAULT_LLM_TEMPERATURE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools: any[] = [buildSubmitOrderTool(webhookUrl)];

  if (restaurant.callForwardingEnabled && restaurant.phoneNumber?.trim()) {
    const transferPhoneNumber = normalizeFrenchPhoneNumber(restaurant.phoneNumber.trim());
    if (transferPhoneNumber) {
      tools.push(buildTransferCallTool(transferPhoneNumber));
    }
  }

  return {
    name: `Yallo - ${restaurant.name}`,
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
      model: "eleven_turbo_v2_5",
      stability: 0.5,
      similarityBoost: 0.75,
      optimizeStreamingLatency: 3,
    },
    transcriber: {
      provider: "deepgram",
      model: "nova-3",
      language: "fr",
    },
    firstMessage: restaurant.welcomeMessage ?? `Bonjour ici ${restaurant.name}, je vous écoute`,
    analysisPlan: buildAnalysisPlan(),
    // Server URL au niveau assistant pour recevoir end-of-call-report (stats d'appels)
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

/**
 * Génère la config complète de l'assistant avec le prompt à jour (incluant l'heure actuelle).
 * Utilisé pour répondre aux messages `assistant-request` de VAPI (appel en temps réel).
 */
export async function buildAssistantPayloadForCall(restaurant: Restaurant) {
  const systemPrompt = await generateSystemPrompt(restaurant, { includeCurrentTime: true });
  return buildAssistantConfig(restaurant, systemPrompt);
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

/**
 * Importe un numéro Twilio dans VAPI et l'associe à un assistant.
 * https://docs.vapi.ai/api-reference/phone-numbers/create
 */
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
      name: `Yallo - ${phoneNumber}`,
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

/**
 * Met à jour un numéro de téléphone VAPI existant pour utiliser un serverUrl dynamique
 * (assistant-request) plutôt qu'un assistantId statique.
 */
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
