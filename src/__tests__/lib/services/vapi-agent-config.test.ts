import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/services/system-prompt", () => ({
  generateSystemPrompt: vi.fn().mockResolvedValue("PROMPT"),
}));
vi.mock("@/lib/logger", () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/services/business-hours", () => ({
  resolveAssistantFirstMessage: vi.fn(() => "Bonjour"),
  resolveCallOrderAvailability: vi.fn(() => ({ canTakeOrders: true, reason: "open", hoursState: "open" })),
}));

const menu = {
  categories: ["Pizzas", "Boissons"],
  donnees_menu: [
    { categorie: "Pizzas", articles: [{ nom: "La 4 fromages" }, { nom: "La Mexicaine" }] },
    { categorie: "Boissons", articles: [{ nom: "Sodas (33cl)" }, { nom: "Redbull" }] },
  ],
};

const restaurant = {
  id: "rest-1",
  name: "Ô Pizz'Burger",
  menuData: menu,
  voiceId: null,
  callForwardingEnabled: false,
  phoneNumber: null,
} as unknown as Parameters<typeof import("@/lib/services/vapi-agent").buildAssistantPayloadForCall>[0];

async function loadAgent() {
  vi.resetModules();
  return import("@/lib/services/vapi-agent");
}

describe("configuration de l'assistant Vapi", () => {
  beforeEach(() => {
    vi.stubEnv("VAPI_LLM_MODEL", "");
    vi.stubEnv("VAPI_VOICE_MODEL", "");
    vi.stubEnv("VAPI_VOICE_STABILITY", "");
    vi.stubEnv("VAPI_TRANSCRIBER_PROVIDER", "");
    vi.stubEnv("VAPI_TRANSCRIBER_MODEL", "");
    vi.stubEnv("VAPI_TRANSCRIBER_KEYTERMS", "");
    vi.stubEnv("VAPI_TRANSCRIBER_LANGUAGE", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses gpt-4o, a slightly brisk expressive voice and an office ambience by default", async () => {
    const { buildAssistantPayloadForCall } = await loadAgent();
    const config = await buildAssistantPayloadForCall(restaurant);

    expect(config.model.model).toBe("gpt-4o");
    expect(config.voice.model).toBe("eleven_flash_v2_5");
    expect(config.voice.stability).toBe(0.5);
    expect(config.voice.speed).toBe(1.1);
    expect(config.backgroundSound).toBe("office");
    expect(config.transcriber).toMatchObject({ provider: "deepgram", model: "nova-3", language: "multi" });
    expect((config.transcriber as { keyterm?: string[] }).keyterm).toEqual(
      expect.arrayContaining(["petite", "moyenne", "grande", "La 4 fromages", "Redbull"])
    );
  });

  it("lets the environment pick the voice model and the transcriber", async () => {
    vi.stubEnv("VAPI_VOICE_MODEL", "eleven_multilingual_v2");
    vi.stubEnv("VAPI_VOICE_STABILITY", "0.4");
    vi.stubEnv("VAPI_TRANSCRIBER_PROVIDER", "openai");
    vi.stubEnv("VAPI_TRANSCRIBER_MODEL", "gpt-4o-transcribe");

    const { buildAssistantPayloadForCall } = await loadAgent();
    const config = await buildAssistantPayloadForCall(restaurant);

    expect(config.voice.model).toBe("eleven_multilingual_v2");
    expect(config.voice.stability).toBe(0.4);
    expect(config.backgroundSound).toBe("office");
    expect(config.transcriber).toEqual({ provider: "openai", model: "gpt-4o-transcribe", language: "fr" });
  });

  it("can switch the keyterms off and the language back to French", async () => {
    vi.stubEnv("VAPI_TRANSCRIBER_KEYTERMS", "false");
    vi.stubEnv("VAPI_TRANSCRIBER_LANGUAGE", "fr");

    const { buildAssistantPayloadForCall } = await loadAgent();
    const config = await buildAssistantPayloadForCall(restaurant);

    expect(config.transcriber).toEqual({ provider: "deepgram", model: "nova-3", language: "fr" });
  });

  it("sends menu names and size words as Deepgram keyterms", async () => {

    const { buildAssistantPayloadForCall, collectTranscriberKeyterms } = await loadAgent();
    const config = await buildAssistantPayloadForCall(restaurant);

    const keyterms = (config.transcriber as { keyterm?: string[] }).keyterm ?? [];
    expect(keyterms).toEqual(expect.arrayContaining(["petite", "moyenne", "grande", "La 4 fromages", "La Mexicaine", "Redbull"]));
    expect(keyterms).toContain("Sodas");
    expect(keyterms).not.toContain("Sodas (33cl)");
    expect(collectTranscriberKeyterms(null)).toEqual(["petite", "moyenne", "grande", "à emporter", "sur place"]);
  });
});
