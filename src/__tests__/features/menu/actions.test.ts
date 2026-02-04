import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMenuData, saveMenuData, generateMenuFromImages, clearMenuData } from "@/features/menu/actions";

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn() as any,
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

vi.mock("@/db/schema", () => ({
  restaurants: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/services/menu-parser", () => ({
  parseMenuFromBase64Images: vi.fn(),
}));

import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { parseMenuFromBase64Images } from "@/lib/services/menu-parser";

describe("menu actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMenuData", () => {
    it("should throw error when not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      await expect(getMenuData()).rejects.toThrow("Non authentifié");
    });

    it("should throw error when no restaurant found", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-1" },
        expires: new Date().toISOString(),
      });
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      await expect(getMenuData()).rejects.toThrow("Restaurant non trouvé");
    });

    it("should return menu data when restaurant exists", async () => {
      const mockMenuData = {
        categories: [{ name: "Tacos", products: [] }],
        option_lists: [],
      };
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-1" },
        expires: new Date().toISOString(),
      });
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ menuData: mockMenuData }]),
        }),
      } as any);

      const result = await getMenuData();

      expect(result).toEqual(mockMenuData);
    });

    it("should return null when menuData is not set", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-1" },
        expires: new Date().toISOString(),
      });
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ menuData: null }]),
        }),
      } as any);

      const result = await getMenuData();

      expect(result).toBeNull();
    });
  });

  describe("generateMenuFromImages", () => {
    it("should return error when no images provided", async () => {
      const result = await generateMenuFromImages([]);

      expect(result).toEqual({
        success: false,
        error: "Aucune image fournie",
      });
    });

    it("should return error when more than 5 images provided", async () => {
      const tooManyImages = Array(6).fill("base64data");

      const result = await generateMenuFromImages(tooManyImages);

      expect(result).toEqual({
        success: false,
        error: "Maximum 5 images autorisées",
      });
    });

    it("should return generated menu data on success", async () => {
      const mockMenuData = {
        categories: [{ name: "Kebabs", products: [] }],
        option_lists: [],
      };
      vi.mocked(parseMenuFromBase64Images).mockResolvedValue(mockMenuData);

      const result = await generateMenuFromImages(["base64image"]);

      expect(result).toEqual({
        success: true,
        menuData: mockMenuData,
      });
      expect(parseMenuFromBase64Images).toHaveBeenCalledWith(["base64image"]);
    });

    it("should return error when parser fails", async () => {
      vi.mocked(parseMenuFromBase64Images).mockRejectedValue(new Error("Parser error"));

      const result = await generateMenuFromImages(["base64image"]);

      expect(result).toEqual({
        success: false,
        error: "Parser error",
      });
    });
  });

  describe("saveMenuData", () => {
    it("should throw error when not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await saveMenuData({ categories: [], option_lists: [] });

      expect(result).toEqual({
        success: false,
        error: "Non authentifié",
      });
    });
  });

  describe("clearMenuData", () => {
    it("should throw error when not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await clearMenuData();

      expect(result).toEqual({
        success: false,
        error: "Non authentifié",
      });
    });
  });
});
