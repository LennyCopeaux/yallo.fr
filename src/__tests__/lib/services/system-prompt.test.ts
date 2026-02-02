import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateSystemPrompt } from "@/lib/services/system-prompt";
import { fetchHubriseCatalog, HubriseError } from "@/lib/services/hubrise";
import { logger } from "@/lib/logger";

vi.mock("@/lib/services/hubrise");
vi.mock("@/lib/logger");
vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
    innerJoin: vi.fn().mockReturnThis(),
  },
}));
vi.mock("@/db/schema", () => ({
  categories: {},
  productVariations: {},
  modifierGroups: {},
  modifiers: {},
  ingredients: {},
  ingredientCategories: {},
}));
vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  asc: vi.fn(),
}));

describe("generateSystemPrompt", () => {
  const mockRestaurant = {
    id: "restaurant-1",
    name: "Test Restaurant",
    hubriseAccessToken: "test-token",
    hubriseLocationId: "test-location",
    businessHours: "Lundi-Vendredi: 10h-22h",
    phoneNumber: "+33123456789",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should use HubRise menu when credentials are available", async () => {
    const mockMenuJson = JSON.stringify({
      categories: [{ name: "Kebab", items: [{ name: "Kebab Veau", price: 7 }] }],
    });
    vi.mocked(fetchHubriseCatalog).mockResolvedValue(mockMenuJson);

    const prompt = await generateSystemPrompt(mockRestaurant);

    expect(fetchHubriseCatalog).toHaveBeenCalledWith("test-token", "test-location");
    expect(prompt).toContain("Test Restaurant");
    expect(prompt).toContain("Lundi-Vendredi: 10h-22h");
    expect(prompt).toContain("+33123456789");
  });

  it("should fallback to Yallo menu when HubRise fails", async () => {
    vi.mocked(fetchHubriseCatalog).mockRejectedValue(new HubriseError("API Error", 500));
    vi.mocked(logger.warn).mockImplementation(() => {});

    const prompt = await generateSystemPrompt(mockRestaurant);

    expect(logger.warn).toHaveBeenCalled();
    expect(prompt).toContain("Test Restaurant");
    expect(prompt).toContain("Horaires d'ouverture");
  });

  it("should handle generic errors from HubRise", async () => {
    vi.mocked(fetchHubriseCatalog).mockRejectedValue(new Error("Network error"));
    vi.mocked(logger.warn).mockImplementation(() => {});

    const prompt = await generateSystemPrompt(mockRestaurant);

    expect(logger.warn).toHaveBeenCalled();
    expect(prompt).toContain("Test Restaurant");
  });

  it("should use Yallo menu when no HubRise credentials", async () => {
    const restaurantWithoutHubrise = {
      ...mockRestaurant,
      hubriseAccessToken: null,
      hubriseLocationId: null,
    };

    const prompt = await generateSystemPrompt(restaurantWithoutHubrise);

    expect(fetchHubriseCatalog).not.toHaveBeenCalled();
    expect(prompt).toContain("Test Restaurant");
    expect(prompt).toContain("Horaires d'ouverture");
  });

  it("should include business hours in prompt", async () => {
    const mockMenuJson = JSON.stringify({
      categories: [{ category: "Kebab", items: [] }],
    });
    vi.mocked(fetchHubriseCatalog).mockResolvedValue(mockMenuJson);

    const prompt = await generateSystemPrompt(mockRestaurant);

    expect(prompt).toContain("Horaires d'ouverture");
    expect(prompt).toContain("Lundi-Vendredi: 10h-22h");
  });

  it("should include phone number for transfer", async () => {
    const mockMenuJson = JSON.stringify({
      categories: [{ category: "Kebab", items: [] }],
    });
    vi.mocked(fetchHubriseCatalog).mockResolvedValue(mockMenuJson);

    const prompt = await generateSystemPrompt(mockRestaurant);

    expect(prompt).toContain("transfère l'appel vers le numéro");
    expect(prompt).toContain("+33123456789");
  });

  it("should include menu structure in prompt", async () => {
    const mockMenuJson = JSON.stringify({
      categories: [{ category: "Kebab", items: [{ name: "Kebab Veau", price: 7 }] }],
    });
    vi.mocked(fetchHubriseCatalog).mockResolvedValue(mockMenuJson);

    const prompt = await generateSystemPrompt(mockRestaurant);

    expect(prompt).toContain("Menu disponible");
    expect(prompt).toContain("Kebab");
  });

  it("should include all required sections in prompt", async () => {
    const mockMenuJson = JSON.stringify({
      categories: [{ category: "Kebab", items: [] }],
    });
    vi.mocked(fetchHubriseCatalog).mockResolvedValue(mockMenuJson);

    const prompt = await generateSystemPrompt(mockRestaurant);

    expect(prompt).toContain("Tu es l'assistant téléphonique");
    expect(prompt).toContain("Ton rôle est de");
    expect(prompt).toContain("Règles importantes");
    expect(prompt).toContain("Menu disponible");
    expect(prompt).toContain("Horaires d'ouverture");
  });

  it("should handle restaurant without business hours", async () => {
    const mockMenuJson = JSON.stringify({
      categories: [{ category: "Kebab", items: [] }],
    });
    vi.mocked(fetchHubriseCatalog).mockResolvedValue(mockMenuJson);

    const restaurantWithoutHours = {
      ...mockRestaurant,
      businessHours: null,
    };

    const prompt = await generateSystemPrompt(restaurantWithoutHours);

    expect(prompt).toContain("Horaires d'ouverture");
    expect(prompt).toContain("Non configuré");
  });
});
