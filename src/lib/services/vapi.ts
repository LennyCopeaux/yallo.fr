import { generateSystemPrompt } from "./system-prompt";
import type { restaurants } from "@/db/schema";
import { logger } from "@/lib/logger";
import { normalizeFrenchPhoneNumber } from "@/lib/utils";

type Restaurant = typeof restaurants.$inferSelect;

const VAPI_API_URL = "https://api.vapi.ai";

/** Modèle OpenAI côté Vapi (GPT-4o mini « cluster » dashboard). Surcharge via VAPI_OPENAI_MODEL. */
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

/**
 * Température LLM : équilibre entre cohérence (prix, options) et formulations naturelles.
 * Surcharge possible via VAPI_OPENAI_TEMPERATURE (ex. "0.35").
 */
const DEFAULT_OPENAI_TEMPERATURE = 0.4;

function getOpenAiTemperature(): number {
  const raw = process.env.VAPI_OPENAI_TEMPERATURE?.trim();
  if (!raw) {
    return DEFAULT_OPENAI_TEMPERATURE;
  }
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n) || n < 0 || n > 2) {
    return DEFAULT_OPENAI_TEMPERATURE;
  }
  return n;
}

/** Voix ElevenLabs (Turbo v2.5). Surcharge : `ELEVENLABS_VOICE_ID`. */
const DEFAULT_ELEVENLABS_VOICE_ID = "dYjOkSQBPiH2igolJfeH";

/** Voix OpenAI TTS en secours (autre fournisseur que 11labs). @see https://docs.vapi.ai/voice-fallback-plan */
const VOICE_FALLBACK_OPENAI_VOICE_ID = "nova";

/** Cartesia « Kira » souvent disponible côté Vapi (secours TTS). Surcharge : `VAPI_VOICE_FALLBACK_CARTESIA_VOICE_ID`. */
const DEFAULT_CARTESIA_FALLBACK_VOICE_ID = "57dcab65-68ac-45a6-8480-6c4c52ec1cd1";

function buildElevenLabsVoice() {
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_ELEVENLABS_VOICE_ID;
  const cartesiaFallbackVoiceId =
    process.env.VAPI_VOICE_FALLBACK_CARTESIA_VOICE_ID?.trim() || DEFAULT_CARTESIA_FALLBACK_VOICE_ID;
  return {
    provider: "11labs" as const,
    voiceId,
    model: "eleven_turbo_v2_5" as const,
    fallbackPlan: {
      voices: [
        {
          provider: "openai" as const,
          voiceId: VOICE_FALLBACK_OPENAI_VOICE_ID,
        },
        {
          provider: "cartesia" as const,
          voiceId: cartesiaFallbackVoiceId,
          model: "sonic-3" as const,
        },
      ],
    },
  };
}

function getApiKey(): string {
  const apiKey = process.env.VAPI_PRIVATE_API_KEY;
  if (!apiKey) {
    throw new Error("VAPI_PRIVATE_API_KEY n'est pas configurée dans les variables d'environnement");
  }
  return apiKey;
}

/**
 * URL publique de l’app (Vercel, etc.) pour que Vapi appelle le webhook tool-calls.
 * Accepte VERCEL_URL / AUTH_URL en secours si NEXT_PUBLIC_APP_URL manque.
 */
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

function getServerUrl(): string | undefined {
  const base = getWebhookBaseUrl();
  if (!base) {
    return undefined;
  }
  const isLocalHttp = base.startsWith("http://") && process.env.NODE_ENV !== "production";
  if (base.startsWith("https://") || isLocalHttp) {
    return `${base}/api/vapi/webhook`;
  }
  return undefined;
}

function getWebhookSecret(): string | undefined {
  const s = process.env.VAPI_WEBHOOK_SECRET?.trim();
  return s && s.length > 0 ? s : undefined;
}

/**
 * Désactive l’analyse legacy (résumé / succès / structured data) côté `analysisPlan`.
 * Les extractions post-appel passent par le plan d’artefacts Vapi si configuré.
 * @see https://docs.vapi.ai/assistants/call-analysis
 */
function buildDisabledLegacyAnalysisPlan() {
  return {
    summaryPrompt: "",
    successEvaluationPrompt: "",
    structuredDataPrompt: "",
  };
}

function buildSubmitOrderTool(serverUrl?: string) {
  const secret = getWebhookSecret();
  return {
    type: "function",
    async: false,
    ...(serverUrl !== undefined
      ? {
          server: {
            url: serverUrl,
            ...(secret !== undefined ? { secret } : {}),
          },
        }
      : {}),
    messages: [
      {
        type: "request-start",
        content: "Je valide votre commande, un instant s'il vous plaît.",
      },
      {
        type: "request-complete",
        content: "Votre commande a bien été enregistrée !",
      },
      {
        type: "request-failed",
        content: "Désolé, je n'ai pas pu enregistrer votre commande. Veuillez réessayer ou appeler directement le restaurant.",
      },
    ],
    function: {
      name: "submit_order",
      description:
        "Soumet la commande en fin d’appel uniquement : articles complets, mode (sur place / emporter / livraison) si pertinent, puis prénom obtenu. Ne pas appeler avant d’avoir le prénom demandé pour la commande.",
      parameters: {
        type: "object",
        properties: {
          customer_name: {
            type: "string",
            description:
              "Prénom ou nom tel que le client vient de le donner pour cette commande (pas d’invention, pas de confusion avec d’autres mots)",
          },
          customer_phone: {
            type: "string",
            description: "Numéro du client si connu (sinon vide ; le numéro d’appel peut être complété côté serveur)",
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
    },
  };
}

function buildAssistantConfig(
  restaurant: Restaurant,
  systemPrompt: string,
  structuredOutputIds: string[]
) {
  const serverUrl = getServerUrl();
  const secret = getWebhookSecret();
  const openAiModel = process.env.VAPI_OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
  const openAiTemperature = getOpenAiTemperature();
  const voice = buildElevenLabsVoice();

  const server =
    serverUrl !== undefined
      ? {
          url: serverUrl,
          ...(secret !== undefined ? { secret } : {}),
        }
      : undefined;

  return {
    name: `Yallo - ${restaurant.name}`,
    model: {
      provider: "openai",
      model: openAiModel,
      temperature: openAiTemperature,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
      ],
      tools: [buildSubmitOrderTool(serverUrl)],
    },
    voice,
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "fr",
      endpointing: 300,
      fallbackPlan: {
        transcribers: [
          {
            provider: "assembly-ai",
            speechModel: "universal-streaming-multilingual",
            language: "multi",
          },
          {
            provider: "azure",
            language: "fr-FR",
          },
        ],
      },
    },
    firstMessage: `Bonjour ici ${restaurant.name}, je vous écoute`,
    analysisPlan: buildDisabledLegacyAnalysisPlan(),
    ...(server !== undefined ? { server } : {}),
    ...(structuredOutputIds.length > 0
      ? { artifactPlan: { structuredOutputIds } }
      : {}),
  };
}

export async function createVapiAssistant(
  restaurant: Restaurant,
  structuredOutputIds: string[]
): Promise<{ id: string }> {
  const apiKey = getApiKey();
  const systemPrompt = await generateSystemPrompt(restaurant);
  const config = buildAssistantConfig(restaurant, systemPrompt, structuredOutputIds);

  const response = await fetch(`${VAPI_API_URL}/assistant`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erreur inconnue" }));
    throw new Error(error.message || `Erreur Vapi API: ${response.status}`);
  }

  return await response.json();
}

export async function updateVapiAssistant(
  assistantId: string,
  restaurant: Restaurant,
  structuredOutputIds: string[]
): Promise<void> {
  const apiKey = getApiKey();
  const systemPrompt = await generateSystemPrompt(restaurant);
  const config = buildAssistantConfig(restaurant, systemPrompt, structuredOutputIds);

  const response = await fetch(`${VAPI_API_URL}/assistant/${assistantId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      voice: config.voice,
      transcriber: config.transcriber,
      firstMessage: config.firstMessage,
      analysisPlan: config.analysisPlan,
      ...(config.server !== undefined ? { server: config.server } : {}),
      ...(structuredOutputIds.length > 0
        ? { artifactPlan: { structuredOutputIds } }
        : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erreur inconnue" }));
    throw new Error(error.message || `Erreur Vapi API: ${response.status}`);
  }
}

export async function deleteVapiAssistant(assistantId: string): Promise<void> {
  const apiKey = getApiKey();

  const response = await fetch(`${VAPI_API_URL}/assistant/${assistantId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erreur inconnue" }));
    throw new Error(error.message || `Erreur Vapi API: ${response.status}`);
  }
}

export async function importTwilioPhoneNumber(
  phoneNumber: string,
  assistantId: string
): Promise<{ id: string }> {
  const apiKey = getApiKey();
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioApiKey = process.env.TWILIO_API_KEY;
  const twilioApiSecret = process.env.TWILIO_API_SECRET;

  if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret) {
    throw new Error("Les identifiants Twilio (TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET) ne sont pas configurés");
  }

  // Normalise le numéro au format E.164 (+33XXXXXXXXX)
  const normalizedNumber = normalizeFrenchPhoneNumber(phoneNumber);
  if (!normalizedNumber) {
    throw new Error(`Format de numéro invalide : "${phoneNumber}". Utilisez le format +33XXXXXXXXX (ex: +33939035299) ou 0XXXXXXXXX (ex: 0939035299)`);
  }

  const serverUrl = getServerUrl();

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
      twilioApiKey,
      twilioApiSecret,
      assistantId,
      ...(serverUrl ? { serverUrl } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erreur inconnue" }));
    logger.error("Erreur import numéro Twilio dans Vapi", new Error(error.message));
    throw new Error(error.message || `Erreur Vapi API: ${response.status}`);
  }

  return await response.json();
}

export async function deleteVapiPhoneNumber(phoneNumberId: string): Promise<void> {
  const apiKey = getApiKey();

  const response = await fetch(`${VAPI_API_URL}/phone-number/${phoneNumberId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erreur inconnue" }));
    throw new Error(error.message || `Erreur Vapi API: ${response.status}`);
  }
}
