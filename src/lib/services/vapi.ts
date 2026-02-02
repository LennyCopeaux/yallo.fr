import { generateSystemPrompt } from "./system-prompt";
import type { restaurants } from "@/db/schema";

type Restaurant = typeof restaurants.$inferSelect;

const VAPI_API_URL = "https://api.vapi.ai";

export async function createVapiAssistant(restaurant: Restaurant): Promise<{ id: string }> {
  const apiKey = process.env.VAPI_PRIVATE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VAPI_PRIVATE_API_KEY n'est pas configurée dans les variables d'environnement");
  }

  const systemPrompt = await generateSystemPrompt(restaurant);

  const response = await fetch(`${VAPI_API_URL}/assistant`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `Assistant ${restaurant.name}`,
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
        ],
      },
      voice: {
        provider: "vapi",
        voiceId: "Elliot",
      },
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "fr",
        endpointing: 500,
      },
      firstMessage: "Bonjour, bienvenue chez " + restaurant.name + ". Comment puis-je vous aider aujourd'hui ?",
      ...(process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")
        ? { serverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/vapi/system-prompt` }
        : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erreur inconnue" }));
    throw new Error(error.message || `Erreur Vapi API: ${response.status}`);
  }

  return await response.json();
}

export async function updateVapiAssistant(assistantId: string, restaurant: Restaurant): Promise<void> {
  const apiKey = process.env.VAPI_PRIVATE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VAPI_PRIVATE_API_KEY n'est pas configurée dans les variables d'environnement");
  }

  const systemPrompt = await generateSystemPrompt(restaurant);

  const response = await fetch(`${VAPI_API_URL}/assistant/${assistantId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erreur inconnue" }));
    throw new Error(error.message || `Erreur Vapi API: ${response.status}`);
  }
}
