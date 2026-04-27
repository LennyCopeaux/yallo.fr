import { generateSystemPrompt } from "./system-prompt";
import type { restaurants } from "@/db/schema";
import { logger } from "@/lib/logger";
import { normalizeFrenchPhoneNumber } from "@/lib/utils";

type Restaurant = typeof restaurants.$inferSelect;

const ELEVENLABS_API_URL = "https://api.elevenlabs.io";

/** Extrait un message d'erreur lisible depuis n'importe quelle réponse API. */
function extractApiErrorMessage(errorBody: unknown, statusCode: number): string {
  if (typeof errorBody === "string") return errorBody;
  if (typeof errorBody === "object" && errorBody !== null) {
    const obj = errorBody as Record<string, unknown>;
    const detail = obj.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return JSON.stringify(detail);
    if (typeof detail === "object" && detail !== null) {
      const d = detail as Record<string, unknown>;
      return typeof d.message === "string" ? d.message : JSON.stringify(detail);
    }
    if (typeof obj.message === "string") return obj.message;
    return JSON.stringify(errorBody);
  }
  return `Erreur ElevenLabs API: ${statusCode}`;
}

/** Modèle LLM utilisé par l'agent ElevenLabs. */
const DEFAULT_LLM_MODEL = "gpt-4o-mini";

/** Température LLM. */
const DEFAULT_LLM_TEMPERATURE = 0.4;

/** Voix ElevenLabs par défaut (Turbo v2.5). Surcharge via ELEVENLABS_VOICE_ID. */
const DEFAULT_VOICE_ID = "dYjOkSQBPiH2igolJfeH";

function getApiKey(): string {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY n'est pas configurée dans les variables d'environnement");
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

function getWebhookUrl(): string | undefined {
  const base = getWebhookBaseUrl();
  if (!base) return undefined;
  const isLocalHttp = base.startsWith("http://") && process.env.NODE_ENV !== "production";
  if (base.startsWith("https://") || isLocalHttp) {
    return `${base}/api/elevenlabs/webhook`;
  }
  return undefined;
}

function getWebhookSecret(): string | undefined {
  const s = process.env.ELEVENLABS_WEBHOOK_SECRET?.trim();
  return s && s.length > 0 ? s : undefined;
}

/**
 * Construit la définition du tool submit_order pour ElevenLabs Conversational AI.
 * https://elevenlabs.io/docs/conversational-ai/customization/tools/server-tools
 */
function buildSubmitOrderTool(webhookUrl?: string) {
  const secret = getWebhookSecret();

  return {
    type: "webhook",
    name: "submit_order",
    description:
      "Soumet la commande en fin d'appel uniquement : articles complets, mode (sur place / emporter / livraison) si pertinent, puis prénom obtenu. Ne pas appeler avant d'avoir le prénom demandé pour la commande.",
    ...(webhookUrl
      ? {
          url: webhookUrl,
          method: "POST",
          headers: secret ? [{ name: "x-elevenlabs-secret", value: secret }] : [],
        }
      : {}),
    input_schema: {
      type: "object",
      properties: {
        customer_name: {
          type: "string",
          description:
            "Prénom ou nom tel que le client vient de le donner pour cette commande (pas d'invention, pas de confusion avec d'autres mots)",
        },
        customer_phone: {
          type: "string",
          description: "Numéro du client si connu (sinon vide ; le numéro d'appel peut être complété côté serveur)",
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
          description: "L'heure de retrait souhaitée par le client (format HH:MM), ou vide si le client n'a pas précisé",
        },
        notes: {
          type: "string",
          description:
            "Notes, allergènes, ou précisions (ex. sur place / à emporter / livraison si non couvert ailleurs)",
        },
      },
      required: ["customer_name", "items"],
    },
  };
}

/**
 * Construit la data collection ElevenLabs (équivalent des structured outputs VAPI).
 * Les données sont extraites post-appel par ElevenLabs automatiquement.
 * https://elevenlabs.io/docs/conversational-ai/customization/data-collection
 */
function buildDataCollection() {
  return {
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
      description: "Résultat principal de l'appel : order_placed, abandoned, transferred, error, ou unknown",
    },
    short_summary: {
      type: "string",
      description: "Résumé de l'appel en une ou deux phrases",
    },
    sentiment: {
      type: "string",
      description: "Sentiment perçu : positive, neutral, ou negative",
    },
  };
}

function buildAgentConfig(restaurant: Restaurant, systemPrompt: string) {
  const webhookUrl = getWebhookUrl();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID;
  const llmModel = process.env.ELEVENLABS_LLM_MODEL?.trim() || DEFAULT_LLM_MODEL;
  const llmTemperature = Number.parseFloat(process.env.ELEVENLABS_LLM_TEMPERATURE?.trim() ?? "") || DEFAULT_LLM_TEMPERATURE;

  return {
    name: `Yallo - ${restaurant.name}`,
    conversation_config: {
      agent: {
        prompt: {
          prompt: systemPrompt,
          llm: llmModel,
          temperature: llmTemperature,
          tools: [buildSubmitOrderTool(webhookUrl)],
        },
        first_message: `Bonjour ici ${restaurant.name}, je vous écoute`,
        language: "fr",
      },
      asr: {
        quality: "high",
        user_input_audio_format: "pcm_16000",
      },
      tts: {
        voice_id: voiceId,
        model_id: "eleven_turbo_v2_5",
        optimize_streaming_latency: 3,
      },
    },
    platform_settings: {
      data_collection: buildDataCollection(),
    },
  };
}

export async function createElevenLabsAgent(restaurant: Restaurant): Promise<{ agent_id: string }> {
  const apiKey = getApiKey();
  const systemPrompt = await generateSystemPrompt(restaurant);
  const config = buildAgentConfig(restaurant, systemPrompt);

  const response = await fetch(`${ELEVENLABS_API_URL}/v1/convai/agents/create`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(extractApiErrorMessage(body, response.status));
  }

  return await response.json();
}

export async function updateElevenLabsAgent(
  agentId: string,
  restaurant: Restaurant
): Promise<void> {
  const apiKey = getApiKey();
  const systemPrompt = await generateSystemPrompt(restaurant);
  const config = buildAgentConfig(restaurant, systemPrompt);

  const response = await fetch(`${ELEVENLABS_API_URL}/v1/convai/agents/${agentId}`, {
    method: "PATCH",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(extractApiErrorMessage(body, response.status));
  }
}

export async function deleteElevenLabsAgent(agentId: string): Promise<void> {
  const apiKey = getApiKey();

  const response = await fetch(`${ELEVENLABS_API_URL}/v1/convai/agents/${agentId}`, {
    method: "DELETE",
    headers: {
      "xi-api-key": apiKey,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(extractApiErrorMessage(body, response.status));
  }
}

/**
 * Importe un numéro Twilio dans ElevenLabs et l'associe à un agent.
 * https://elevenlabs.io/docs/conversational-ai/phone-calling
 */
export async function importTwilioPhoneNumber(
  phoneNumber: string,
  agentId: string
): Promise<{ phone_number_id: string }> {
  const apiKey = getApiKey();
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioApiKey = process.env.TWILIO_API_KEY;
  const twilioApiSecret = process.env.TWILIO_API_SECRET;

  if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret) {
    throw new Error(
      "Les identifiants Twilio (TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET) ne sont pas configurés"
    );
  }

  const normalizedNumber = normalizeFrenchPhoneNumber(phoneNumber);
  if (!normalizedNumber) {
    throw new Error(
      `Format de numéro invalide : "${phoneNumber}". Utilisez le format +33XXXXXXXXX (ex: +33939035299) ou 0XXXXXXXXX (ex: 0939035299)`
    );
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/v1/convai/phone-numbers/create`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone_number: normalizedNumber,
      label: `Yallo - ${phoneNumber}`,
      provider: "twilio",
      sid: twilioAccountSid,
      api_key_sid: twilioApiKey,
      api_key_secret: twilioApiSecret,
      agent_id: agentId,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const msg = extractApiErrorMessage(body, response.status);
    logger.error("Erreur import numéro Twilio dans ElevenLabs", new Error(msg));
    throw new Error(msg);
  }

  return await response.json();
}

export async function deleteElevenLabsPhoneNumber(phoneNumberId: string): Promise<void> {
  const apiKey = getApiKey();

  const response = await fetch(`${ELEVENLABS_API_URL}/v1/convai/phone-numbers/${phoneNumberId}`, {
    method: "DELETE",
    headers: {
      "xi-api-key": apiKey,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(extractApiErrorMessage(body, response.status));
  }
}
