/**
 * Ressources d’analyse post-appel (API Vapi). Utilisées pour lier le plan d’artefacts à l’assistant.
 * @see https://docs.vapi.ai/assistants/structured-outputs-quickstart
 */

const VAPI_API_URL = "https://api.vapi.ai";

/** Schémas d’extraction (plusieurs entrées pour les exigences de publication dashboard). */
const YALLO_STRUCTURED_OUTPUT_SPECS = [
  {
    name: "Yallo — Identité client",
    description: "Nom et téléphone du client après l’appel.",
    schema: {
      type: "object",
      properties: {
        customer_name: {
          type: "string",
          description: "Prénom ou nom donné par le client",
        },
        customer_phone: {
          anyOf: [{ type: "string" }, { type: "null" }],
          description: "Numéro du client (E.164 ou tel que mentionné), null si non mentionné",
        },
      },
      required: ["customer_name", "customer_phone"],
    },
  },
  {
    name: "Yallo — Détail commande",
    description: "Résumé textuel des articles et options.",
    schema: {
      type: "object",
      properties: {
        items_summary: {
          type: "string",
          description: "Liste ou résumé des produits commandés avec options",
        },
        estimated_total_eur: {
          anyOf: [{ type: "number" }, { type: "null" }],
          description: "Total estimé en euros si mentionné, null si non précisé",
        },
      },
      required: ["items_summary", "estimated_total_eur"],
    },
  },
  {
    name: "Yallo — Retrait",
    description: "Créneau ou mode de retrait.",
    schema: {
      type: "object",
      properties: {
        pickup_time: {
          anyOf: [{ type: "string" }, { type: "null" }],
          description: "Heure de retrait (HH:MM), null si non précisé",
        },
        asap: {
          type: "boolean",
          description: "True si le client veut le plus tôt possible",
        },
      },
      required: ["pickup_time", "asap"],
    },
  },
  {
    name: "Yallo — Issue appel",
    description: "Commande validée ou abandon / erreur.",
    schema: {
      type: "object",
      properties: {
        order_confirmed: {
          type: "boolean",
          description: "True si la commande a été enregistrée (tool submit_order OK)",
        },
        outcome: {
          type: "string",
          enum: ["order_placed", "abandoned", "transferred", "error", "unknown"],
          description: "Résultat principal de l’appel",
        },
      },
      required: ["order_confirmed", "outcome"],
    },
  },
  {
    name: "Yallo — Notes & sentiment",
    description: "Synthèse courte et ressenti client.",
    schema: {
      type: "object",
      properties: {
        short_summary: {
          type: "string",
          description: "Résumé en une ou deux phrases",
        },
        sentiment: {
          type: "string",
          enum: ["positive", "neutral", "negative"],
          description: "Sentiment perçu",
        },
      },
      required: ["short_summary", "sentiment"],
    },
  },
] as const;

function getApiKey(): string {
  const apiKey = process.env.VAPI_PRIVATE_API_KEY;
  if (!apiKey) {
    throw new Error("VAPI_PRIVATE_API_KEY n'est pas configurée dans les variables d'environnement");
  }
  return apiKey;
}

/**
 * Parse une liste d’IDs (env ou DB), virgules, espaces ignorés.
 */
export function parseStructuredOutputIds(raw: string | null | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * IDs depuis `VAPI_STRUCTURED_OUTPUT_IDS` (plusieurs sorties, virgule).
 */
export function getStructuredOutputIdsFromEnv(): string[] {
  return parseStructuredOutputIds(process.env.VAPI_STRUCTURED_OUTPUT_IDS);
}

type YalloStructuredOutputSpec = (typeof YALLO_STRUCTURED_OUTPUT_SPECS)[number];

async function postStructuredOutput(apiKey: string, spec: YalloStructuredOutputSpec): Promise<string> {
  const response = await fetch(`${VAPI_API_URL}/structured-output`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: spec.name,
      type: "ai",
      description: spec.description,
      schema: spec.schema,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erreur inconnue" }));
    throw new Error(
      typeof error.message === "string"
        ? error.message
        : `Erreur Vapi structured-output: ${response.status}`
    );
  }

  const data = (await response.json()) as { id?: string };
  if (!data.id) {
    throw new Error("Réponse Vapi structured-output sans id");
  }
  return data.id;
}

/**
 * Crée les ressources d’analyse par défaut sur le compte Vapi et retourne leurs IDs (ordre stable).
 */
export async function createYalloDefaultStructuredOutputBatch(): Promise<string[]> {
  const apiKey = getApiKey();
  const ids: string[] = [];
  for (const spec of YALLO_STRUCTURED_OUTPUT_SPECS) {
    ids.push(await postStructuredOutput(apiKey, spec));
  }
  return ids;
}
async function patchStructuredOutput(apiKey: string, id: string, spec: YalloStructuredOutputSpec): Promise<void> {
  const response = await fetch(`${VAPI_API_URL}/structured-output/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: spec.name,
      type: "ai",
      description: spec.description,
      schema: spec.schema,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erreur inconnue" }));
    throw new Error(
      typeof error.message === "string"
        ? error.message
        : `Erreur Vapi PATCH structured-output ${id}: ${response.status}`
    );
  }
}

/**
 * Met à jour les schemas des structured outputs existants dans Vapi (corrige `required`, types, etc.).
 * Les IDs doivent être dans le même ordre que YALLO_STRUCTURED_OUTPUT_SPECS.
 */
export async function updateYalloStructuredOutputBatch(ids: string[]): Promise<void> {
  const apiKey = getApiKey();
  const specs = YALLO_STRUCTURED_OUTPUT_SPECS;
  for (let i = 0; i < Math.min(ids.length, specs.length); i++) {
    await patchStructuredOutput(apiKey, ids[i], specs[i]);
  }
}
export function joinStructuredOutputIds(ids: string[]): string {
  return ids.join(",");
}
