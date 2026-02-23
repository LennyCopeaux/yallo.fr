import { describe, it, expect, vi, beforeEach } from "vitest";
import { getKitchenStatus, updateKitchenStatus, updateStatusSettings } from "@/features/kitchen-status/actions";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { auth } from "@/lib/auth/auth";
import { DEFAULT_STATUS_SETTINGS } from "@/features/kitchen-status/constants";

vi.mock("@/db", () => ({
  db: {
    query: {
      restaurants: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(),
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Kitchen Status Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getKitchenStatus", () => {
    it("should return kitchen status for authenticated user", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as any);

      const mockRestaurant = {
        id: "rest-123",
        currentStatus: "NORMAL",
        statusSettings: { CALM: { fixed: 5 }, NORMAL: { min: 10, max: 15 } },
      };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as any);

      const result = await getKitchenStatus();

      expect(result).toEqual(mockRestaurant);
    });

    it("should initialize default settings if none exist", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as any);

      const mockRestaurant = {
        id: "rest-123",
        currentStatus: "NORMAL",
        statusSettings: null,
      };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as any);

      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      vi.mocked(db.update).mockReturnValue(updateMock() as any);

      const result = await getKitchenStatus();

      expect(db.update).toHaveBeenCalled();
      expect(result?.statusSettings).toEqual(DEFAULT_STATUS_SETTINGS);
    });

    it("should return null for unauthenticated user", async () => {
      vi.mocked(auth).mockResolvedValue(null as any);

      const result = await getKitchenStatus();

      expect(result).toBeNull();
    });

    it("should return null if restaurant not found", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as any);

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(undefined);

      const result = await getKitchenStatus();

      expect(result).toBeNull();
    });
  });

  describe("updateKitchenStatus", () => {
    it("should update status successfully", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as any);

      const mockRestaurant = { id: "rest-123", ownerId: "user-123" };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as any);

      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      vi.mocked(db.update).mockReturnValue(updateMock() as any);

      const result = await updateKitchenStatus("RUSH");

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw error for invalid status", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as any);

      await expect(updateKitchenStatus("INVALID" as any)).rejects.toThrow("Statut invalide");
    });

    it("should throw error for unauthenticated user", async () => {
      vi.mocked(auth).mockResolvedValue(null as any);

      await expect(updateKitchenStatus("NORMAL")).rejects.toThrow("Non autorisé");
    });

    it("should throw error if restaurant not found", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as any);

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(undefined);

      await expect(updateKitchenStatus("NORMAL")).rejects.toThrow("Restaurant non trouvé");
    });
  });

  describe("updateStatusSettings", () => {
    it("should update settings successfully", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as any);

      const mockRestaurant = {
        id: "rest-123",
        ownerId: "user-123",
        statusSettings: { CALM: { fixed: 5 } },
      };

      const newSettings = { NORMAL: { min: 10, max: 15 } };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as any);

      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      vi.mocked(db.update).mockReturnValue(updateMock() as any);

      const result = await updateStatusSettings(newSettings);

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });

    it("should merge with existing settings", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as any);

      const mockRestaurant = {
        id: "rest-123",
        ownerId: "user-123",
        statusSettings: { CALM: { fixed: 5 } },
      };

      const newSettings = { NORMAL: { min: 10, max: 15 } };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as any);

      const setFn = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });
      const updateMock = vi.fn().mockReturnValue({
        set: setFn,
      });
      vi.mocked(db.update).mockReturnValue(updateMock() as any);

      await updateStatusSettings(newSettings);

      expect(setFn).toHaveBeenCalled();
      const setCall = setFn.mock.calls[0][0];
      expect(setCall.statusSettings).toHaveProperty("CALM");
      expect(setCall.statusSettings).toHaveProperty("NORMAL");
    });

    it("should throw error for invalid settings", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as any);

      await expect(updateStatusSettings({ CALM: { fixed: -1 } } as any)).rejects.toThrow();
    });

    it("should throw error for unauthenticated user", async () => {
      vi.mocked(auth).mockResolvedValue(null as any);

      await expect(updateStatusSettings({})).rejects.toThrow("Non autorisé");
    });
  });
});
