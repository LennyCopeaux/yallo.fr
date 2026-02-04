import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();

vi.mock("openai", () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      };
    },
  };
});

describe("menu-parser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("parseMenuFromImages", () => {
    it("should throw error when no API key is configured", async () => {
      vi.stubEnv("OPENAI_API_KEY", "");

      vi.resetModules();
      const { parseMenuFromImages } = await import("@/lib/services/menu-parser");

      await expect(parseMenuFromImages(["https://example.com/image.jpg"]))
        .rejects
        .toThrow("OPENAI_API_KEY is not configured");
    });

    it("should throw error when no images provided", async () => {
      vi.stubEnv("OPENAI_API_KEY", "test-key");

      vi.resetModules();
      const { parseMenuFromImages } = await import("@/lib/services/menu-parser");

      await expect(parseMenuFromImages([]))
        .rejects
        .toThrow("At least one image URL is required");
    });

    it("should throw error when more than 5 images provided", async () => {
      vi.stubEnv("OPENAI_API_KEY", "test-key");

      vi.resetModules();
      const { parseMenuFromImages } = await import("@/lib/services/menu-parser");

      const tooManyImages = Array(6).fill("https://example.com/image.jpg");

      await expect(parseMenuFromImages(tooManyImages))
        .rejects
        .toThrow("Maximum 5 images allowed per request");
    });

    it("should parse menu from images successfully", async () => {
      vi.stubEnv("OPENAI_API_KEY", "test-key");

      const mockMenuData = {
        categories: [{ name: "Tacos", products: [] }],
        option_lists: [],
      };

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockMenuData) } }],
      });

      vi.resetModules();
      const { parseMenuFromImages } = await import("@/lib/services/menu-parser");

      const result = await parseMenuFromImages(["https://example.com/menu.jpg"]);

      expect(result).toEqual(mockMenuData);
    });

    it("should throw error when no response from OpenAI", async () => {
      vi.stubEnv("OPENAI_API_KEY", "test-key");

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      vi.resetModules();
      const { parseMenuFromImages } = await import("@/lib/services/menu-parser");

      await expect(parseMenuFromImages(["https://example.com/menu.jpg"]))
        .rejects
        .toThrow("No response from OpenAI");
    });

    it("should add default arrays if not present", async () => {
      vi.stubEnv("OPENAI_API_KEY", "test-key");

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "{}" } }],
      });

      vi.resetModules();
      const { parseMenuFromImages } = await import("@/lib/services/menu-parser");

      const result = await parseMenuFromImages(["https://example.com/menu.jpg"]);

      expect(result.categories).toEqual([]);
      expect(result.option_lists).toEqual([]);
    });
  });

  describe("parseMenuFromBase64Images", () => {
    it("should convert base64 to data URLs and parse", async () => {
      vi.stubEnv("OPENAI_API_KEY", "test-key");

      const mockMenuData = {
        categories: [{ name: "Kebabs", products: [] }],
        option_lists: [],
      };

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockMenuData) } }],
      });

      vi.resetModules();
      const { parseMenuFromBase64Images } = await import("@/lib/services/menu-parser");

      const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk";

      const result = await parseMenuFromBase64Images([base64Image]);

      expect(result).toEqual(mockMenuData);
    });

    it("should preserve data URLs that already have prefix", async () => {
      vi.stubEnv("OPENAI_API_KEY", "test-key");

      const mockMenuData = {
        categories: [],
        option_lists: [],
      };

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockMenuData) } }],
      });

      vi.resetModules();
      const { parseMenuFromBase64Images } = await import("@/lib/services/menu-parser");

      const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk";

      const result = await parseMenuFromBase64Images([dataUrl]);

      expect(result).toEqual(mockMenuData);
    });
  });
});
