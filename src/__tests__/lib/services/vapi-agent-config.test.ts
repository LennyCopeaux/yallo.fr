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
    vi.stubEnv("VAPI_BACKGROUND_SOUND", "");
    vi.stubEnv("VAPI_TRANSCRIBER_PROVIDER", "");
    vi.stubEnv("VAPI_TRANSCRIBER_MODEL", "");
    vi.stubEnv("VAPI_TRANSCRIBER_KEYTERMS", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses gpt-4o, an expressive voice and no background sound by default", async () => {
    const { buildAssistantPayloadForCall } = await loadAgent();
    const config = await buildAssistantPayloadForCall(restaurant);

    expect(config.model.model).toBe("gpt-4o");
    expect(config.voice.model).toBe("eleven_flash_v2_5");
    expect(config.voice.stability).toBe(0.5);
    expect(config.backgroundSound).toBe("off");
    expect(config.transcriber).toEqual({ provider: "deepgram", model: "nova-3", language: "fr" });
  });

  it("lets the environment pick the voice model, the ambience and the transcriber", async () => {
    vi.stubEnv("VAPI_VOICE_MODEL", "eleven_multilingual_v2");
    vi.stubEnv("VAPI_VOICE_STABILITY", "0.4");
    vi.stubEnv("VAPI_BACKGROUND_SOUND", "https://app.yallo.fr/sounds/restaurant.mp3");
    vi.stubEnv("VAPI_TRANSCRIBER_PROVIDER", "openai");
    vi.stubEnv("VAPI_TRANSCRIBER_MODEL", "gpt-4o-transcribe");

    const { buildAssistantPayloadForCall } = await loadAgent();
    const config = await buildAssistantPayloadForCall(restaurant);

    expect(config.voice.model).toBe("eleven_multilingual_v2");
    expect(config.voice.stability).toBe(0.4);
    expect(config.backgroundSound).toBe("https://app.yallo.fr/sounds/restaurant.mp3");
    expect(config.transcriber).toEqual({ provider: "openai", model: "gpt-4o-transcribe", language: "fr" });
  });

  it("ignores an invalid background sound value", async () => {
    vi.stubEnv("VAPI_BACKGROUND_SOUND", "http://insecure.example/a.mp3");

    const { buildAssistantPayloadForCall } = await loadAgent();
    const config = await buildAssistantPayloadForCall(restaurant);

    expect(config.backgroundSound).toBe("off");
  });

  it("sends menu names and size words as Deepgram keyterms when enabled", async () => {
    vi.stubEnv("VAPI_TRANSCRIBER_KEYTERMS", "true");

    const { buildAssistantPayloadForCall, collectTranscriberKeyterms } = await loadAgent();
    const config = await buildAssistantPayloadForCall(restaurant);

    const keyterms = (config.transcriber as { keyterm?: string[] }).keyterm ?? [];
    expect(keyterms).toEqual(expect.arrayContaining(["petite", "moyenne", "grande", "La 4 fromages", "La Mexicaine", "Redbull"]));
    expect(keyterms).toContain("Sodas");
    expect(keyterms).not.toContain("Sodas (33cl)");
    expect(collectTranscriberKeyterms(null)).toEqual(["petite", "moyenne", "grande", "à emporter", "sur place"]);
  });
});
