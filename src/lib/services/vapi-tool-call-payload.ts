/**
 * Normalise les payloads « tool-calls » Vapi : plusieurs formes possibles (toolCallList, toolWithToolCallList, toolCalls style OpenAI).
 * Vapi peut envoyer toolCallList + toolCalls en parallèle : la liste peut avoir des entrées sans `name` ; le détail est dans toolCalls.
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

function mapOpenAiToolCalls(
  toolCalls: NonNullable<VapiToolCallsMessage["toolCalls"]>
): NormalizedVapiToolCall[] {
  return toolCalls.map((tc) => ({
    id: tc.id,
    name: tc.function?.name ?? "",
    ...(tc.function?.arguments !== undefined ? { arguments: tc.function.arguments } : {}),
  }));
}

function mapToolCallList(
  list: NonNullable<VapiToolCallsMessage["toolCallList"]>
): NormalizedVapiToolCall[] {
  return list.map((t) => ({
    id: t.id,
    name: t.name ?? "",
    ...(t.parameters !== undefined ? { parameters: t.parameters } : {}),
    ...(t.arguments !== undefined ? { arguments: t.arguments } : {}),
  }));
}

function mapToolWithToolCallList(
  list: NonNullable<VapiToolCallsMessage["toolWithToolCallList"]>
): NormalizedVapiToolCall[] {
  return list.map((t) => ({
    id: t.toolCall.id,
    name: t.name || t.toolCall.name || "",
    ...(t.toolCall.parameters !== undefined ? { parameters: t.toolCall.parameters } : {}),
    ...(t.toolCall.arguments !== undefined ? { arguments: t.toolCall.arguments } : {}),
  }));
}

/**
 * Fusionne deux entrées même id : garde nom + arguments les plus complets.
 */
function mergeSameId(a: NormalizedVapiToolCall, b: NormalizedVapiToolCall): NormalizedVapiToolCall {
  const nameA = a.name.trim();
  const nameB = b.name.trim();
  const name = nameB.length > 0 ? b.name : nameA.length > 0 ? a.name : a.name || b.name;

  const argsA = a.arguments !== undefined;
  const argsB = b.arguments !== undefined;
  const arguments_ = argsB ? b.arguments : argsA ? a.arguments : b.arguments ?? a.arguments;

  const paramsA = a.parameters !== undefined;
  const paramsB = b.parameters !== undefined;
  const parameters = paramsB ? b.parameters : paramsA ? a.parameters : b.parameters ?? a.parameters;

  return {
    id: a.id,
    name,
    ...(parameters !== undefined ? { parameters } : {}),
    ...(arguments_ !== undefined ? { arguments: arguments_ } : {}),
  };
}

/**
 * Fusionne toutes les formes connues. Ordre : OpenAI `toolCalls` en premier (souvent le seul avec `function.name`),
 * puis toolCallList / toolWithToolCallList pour compléter par id.
 */
export function collectToolCallsFromVapiMessage(message: VapiToolCallsMessage | undefined): NormalizedVapiToolCall[] {
  if (!message) {
    return [];
  }

  const batches: NormalizedVapiToolCall[] = [];

  if (message.toolCalls && message.toolCalls.length > 0) {
    batches.push(...mapOpenAiToolCalls(message.toolCalls));
  }
  if (message.toolCallList && message.toolCallList.length > 0) {
    batches.push(...mapToolCallList(message.toolCallList));
  }
  if (message.toolWithToolCallList && message.toolWithToolCallList.length > 0) {
    batches.push(...mapToolWithToolCallList(message.toolWithToolCallList));
  }

  const byId = new Map<string, NormalizedVapiToolCall>();
  for (const t of batches) {
    const existing = byId.get(t.id);
    if (!existing) {
      byId.set(t.id, t);
    } else {
      byId.set(t.id, mergeSameId(existing, t));
    }
  }

  return [...byId.values()];
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

/**
 * Corps JSON webhook Vapi : `toolCalls` peut être sous `message` ou à la racine (selon version / proxy).
 */
export function buildVapiToolCallsMessageFromBody(body: unknown): VapiToolCallsMessage {
  const b = body as Record<string, unknown>;
  const message = (b.message ?? {}) as VapiToolCallsMessage;
  const rootToolCalls = b.toolCalls;

  const toolCallsFromMessage = message.toolCalls;
  const toolCallsFromRoot = Array.isArray(rootToolCalls) ? rootToolCalls : undefined;

  return {
    ...message,
    toolCalls:
      toolCallsFromMessage && toolCallsFromMessage.length > 0
        ? toolCallsFromMessage
        : (toolCallsFromRoot as VapiToolCallsMessage["toolCalls"]),
  };
}

export function webhookBodyHasToolCallsPayload(body: unknown): boolean {
  const msg = buildVapiToolCallsMessageFromBody(body);
  return vapiMessageHasToolCalls(msg);
}
