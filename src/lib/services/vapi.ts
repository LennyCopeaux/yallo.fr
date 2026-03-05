import { generateSystemPrompt } from "./system-prompt";
import type { restaurants } from "@/db/schema";
import { logger } from "@/lib/logger";
import { normalizeFrenchPhoneNumber } from "@/lib/utils";

type Restaurant = typeof restaurants.$inferSelect;

const VAPI_API_URL = "https://api.vapi.ai";

function getApiKey(): string {
  const apiKey = process.env.VAPI_PRIVATE_API_KEY;
  if (!apiKey) {
    throw new Error("VAPI_PRIVATE_API_KEY n'est pas configurée dans les variables d'environnement");
  }
  return apiKey;
}

function getServerUrl(): string | undefined {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl?.startsWith("https://")) {
    return `${appUrl}/api/vapi/webhook`;
  }
  return undefined;
}

function buildSubmitOrderTool(serverUrl?: string) {
  return {
    type: "function",
    async: false,
    ...(serverUrl ? { server: { url: serverUrl } } : {}),
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
      description: "Soumet la commande finale du client au restaurant. Appeler cette fonction uniquement quand le client a confirmé sa commande complète et donné son nom.",
      parameters: {
        type: "object",
        properties: {
          customer_name: {
            type: "string",
            description: "Le prénom ou nom du client",
          },
          customer_phone: {
            type: "string",
            description: "Le numéro de téléphone du client (celui qui appelle)",
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
                  description: "La quantité commandée",
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
            description: "Notes ou demandes spéciales du client",
          },
        },
        required: ["customer_name", "items"],
      },
    },
  };
}

function buildAssistantConfig(restaurant: Restaurant, systemPrompt: string) {
  const serverUrl = getServerUrl();
  return {
    name: `Yallo - ${restaurant.name}`,
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
      ],
      tools: [buildSubmitOrderTool(serverUrl)],
    },
    voice: {
      provider: "cartesia",
      voiceId: "694f9389-aac1-45b6-b726-9d9369183238", // À remplacer par un voiceId français de France depuis le dashboard Vapi
      model: "sonic-3",
      experimentalControls: {
        speed: "fastest",        // Vitesse maximale pour un rythme dynamique
        emotion: [
          "positivity:high",     // Ton positif et énergique
          "curiosity:high"       // Proactif, propose des choses
        ],
      },
    },
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "fr",
      endpointing: 300,
    },
    firstMessage: `Bonjour ${restaurant.name}, qu'est-ce que vous prenez ?`,
    ...(serverUrl ? { serverUrl } : {}),
  };
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
    const error = await response.json().catch(() => ({ message: "Erreur inconnue" }));
    throw new Error(error.message || `Erreur Vapi API: ${response.status}`);
  }

  return await response.json();
}

export async function updateVapiAssistant(assistantId: string, restaurant: Restaurant): Promise<void> {
  const apiKey = getApiKey();
  const systemPrompt = await generateSystemPrompt(restaurant);
  const config = buildAssistantConfig(restaurant, systemPrompt);

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
      ...(config.serverUrl ? { serverUrl: config.serverUrl } : {}),
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
