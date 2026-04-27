// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getKitchenStatus, updateKitchenStatus, updateStatusSettings, type StatusSettings } from "@/features/kitchen-status/actions";
import { db } from "@/db";
import { getAppUser, requireAuth } from "@/lib/auth";
import { DEFAULT_STATUS_SETTINGS } from "@/features/kitchen-status/constants";
import type { SelectRestaurant, KitchenStatus } from "@/db/schema";

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

vi.mock("@/lib/auth", () => ({
  getAppUser: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockOwner = {
  id: "user-123",
  authUserId: "auth-123",
  email: "test@test.com",
  firstName: null,
  lastName: null,
  role: "OWNER" as const,
  createdAt: new Date(),
};

describe("Kitchen Status Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getKitchenStatus", () => {
    it("should return kitchen status for authenticated user", async () => {
      vi.mocked(getAppUser).mockResolvedValue(mockOwner);

      const mockRestaurant = {
        id: "rest-123",
        currentStatus: "NORMAL",
        statusSettings: { CALM: { fixed: 5 }, NORMAL: { min: 10, max: 15 } },
      };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as unknown as SelectRestaurant | undefined);

      const result = await getKitchenStatus();

      expect(result).toEqual(mockRestaurant);
    });

    it("should initialize default settings if none exist", async () => {
      vi.mocked(getAppUser).mockResolvedValue(mockOwner);

      const mockRestaurant = {
        id: "rest-123",
        currentStatus: "NORMAL",
        statusSettings: null,
      };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as unknown as SelectRestaurant | undefined);

      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      vi.mocked(db.update).mockReturnValue(updateMock() as unknown as ReturnType<typeof db.update>);

      const result = await getKitchenStatus();

      expect(db.update).toHaveBeenCalled();
      expect(result?.statusSettings).toEqual(DEFAULT_STATUS_SETTINGS);
    });

    it("should return null for unauthenticated user", async () => {
      vi.mocked(getAppUser).mockResolvedValue(null);

      const result = await getKitchenStatus();

      expect(result).toBeNull();
    });

    it("should return null if restaurant not found", async () => {
      vi.mocked(getAppUser).mockResolvedValue(mockOwner);

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(undefined);

      const result = await getKitchenStatus();

      expect(result).toBeNull();
    });
  });

  describe("updateKitchenStatus", () => {
    it("should update status successfully", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

      const mockRestaurant = { id: "rest-123", ownerId: "user-123" };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as unknown as SelectRestaurant | undefined);

      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      vi.mocked(db.update).mockReturnValue(updateMock() as unknown as ReturnType<typeof db.update>);

      const result = await updateKitchenStatus("RUSH");

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw error for invalid status", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

      await expect(updateKitchenStatus("INVALID" as KitchenStatus)).rejects.toThrow("Statut invalide");
    });

    it("should throw error for unauthenticated user", async () => {
      vi.mocked(requireAuth).mockRejectedValue(new Error("Non autorisé"));

      await expect(updateKitchenStatus("NORMAL")).rejects.toThrow("Non autorisé");
    });

    it("should throw error if restaurant not found", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(undefined);

      await expect(updateKitchenStatus("NORMAL")).rejects.toThrow("Restaurant non trouvé");
    });
  });

  describe("updateStatusSettings", () => {
    it("should update settings successfully", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

      const mockRestaurant = {
        id: "rest-123",
        ownerId: "user-123",
        statusSettings: { CALM: { fixed: 5 } },
      };

      const newSettings = { NORMAL: { min: 10, max: 15 } };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as unknown as SelectRestaurant | undefined);

      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      vi.mocked(db.update).mockReturnValue(updateMock() as unknown as ReturnType<typeof db.update>);

      const result = await updateStatusSettings(newSettings);

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });

    it("should merge with existing settings", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

      const mockRestaurant = {
        id: "rest-123",
        ownerId: "user-123",
        statusSettings: { CALM: { fixed: 5 } },
      };

      const newSettings = { NORMAL: { min: 10, max: 15 } };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as unknown as SelectRestaurant | undefined);

      const setFn = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });
      const updateMock = vi.fn().mockReturnValue({
        set: setFn,
      });
      vi.mocked(db.update).mockReturnValue(updateMock() as unknown as ReturnType<typeof db.update>);

      await updateStatusSettings(newSettings);

      expect(setFn).toHaveBeenCalled();
      const setCall = setFn.mock.calls[0][0];
      expect(setCall.statusSettings).toHaveProperty("CALM");
      expect(setCall.statusSettings).toHaveProperty("NORMAL");
    });

    it("should throw error for invalid settings", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

      await expect(updateStatusSettings({ CALM: { fixed: -1 } } as StatusSettings)).rejects.toThrow();
    });

    it("should throw error for unauthenticated user", async () => {
      vi.mocked(requireAuth).mockRejectedValue(new Error("Non autorisé"));

      await expect(updateStatusSettings({})).rejects.toThrow("Non autorisé");
    });
  });
});
