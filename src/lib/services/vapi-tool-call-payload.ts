/**
 * Normalise les payloads « tool-calls » Vapi : plusieurs formes possibles (toolCallList, toolWithToolCallList, toolCalls style OpenAI).
 */

export interface NormalizedVapiToolCall {
  id: string;
  name: string;
  parameters?: Record<string, unknown>;
  arguments?: string | Record<string, unknown>;
}

/** Message Vapi `message` pour un événement tool-calls (champs optionnels selon la version). */
export type VapiToolCallsMessage = {
  toolCallList?: Array<{
    id: string;
    name?: string;
    parameters?: Record<string, unknown>;
    arguments?: string | Record<string, unknown>;
  }>;
  toolWithToolCallList?: Array<{
    name: string;
    toolCall: {
      id: string;
      name?: string;
      parameters?: Record<string, unknown>;
      arguments?: string | Record<string, unknown>;
    };
  }>;
  /** Format OpenAI / transcripts (function.name + arguments JSON string). */
  toolCalls?: Array<{
    id: string;
    type?: string;
    function?: {
      name?: string;
      arguments?: string;
    };
  }>;
};

/**
 * Fusionne toutes les formes connues en une liste unique pour le webhook.
 */
export function collectToolCallsFromVapiMessage(message: VapiToolCallsMessage | undefined): NormalizedVapiToolCall[] {
  if (!message) {
    return [];
  }

  if (message.toolCallList && message.toolCallList.length > 0) {
    return message.toolCallList.map((t) => ({
      id: t.id,
      name: t.name ?? "",
      ...(t.parameters !== undefined ? { parameters: t.parameters } : {}),
      ...(t.arguments !== undefined ? { arguments: t.arguments } : {}),
    }));
  }

  if (message.toolWithToolCallList && message.toolWithToolCallList.length > 0) {
    return message.toolWithToolCallList.map((t) => ({
      id: t.toolCall.id,
      name: t.name || t.toolCall.name || "",
      ...(t.toolCall.parameters !== undefined ? { parameters: t.toolCall.parameters } : {}),
      ...(t.toolCall.arguments !== undefined ? { arguments: t.toolCall.arguments } : {}),
    }));
  }

  if (message.toolCalls && message.toolCalls.length > 0) {
    return message.toolCalls.map((tc) => ({
      id: tc.id,
      name: tc.function?.name ?? "",
      ...(tc.function?.arguments !== undefined ? { arguments: tc.function.arguments } : {}),
    }));
  }

  return [];
}

export function vapiMessageHasToolCalls(message: VapiToolCallsMessage | undefined): boolean {
  if (!message) {
    return false;
  }
  const list = message.toolCallList?.length ?? 0;
  const withList = message.toolWithToolCallList?.length ?? 0;
  const openAi = message.toolCalls?.length ?? 0;
  return list > 0 || withList > 0 || openAi > 0;
}
