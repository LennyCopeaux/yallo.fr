// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserRestaurant, getOrders, updateOrderStatus } from "@/features/orders/actions";
import { db } from "@/db";
import { getAppUser, requireAuth } from "@/lib/auth";
import type { SelectRestaurant, SelectOrder } from "@/db/schema";

vi.mock("@/db", () => ({
  db: {
    query: {
      restaurants: {
        findFirst: vi.fn(),
      },
      orders: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(),
    insert: vi.fn(),
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

describe("Orders Actions Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserRestaurant", () => {
    it("should return restaurant for authenticated user", async () => {
      vi.mocked(getAppUser).mockResolvedValue(mockOwner);

      const mockRestaurant = {
        id: "rest-123",
        name: "Test Restaurant",
        ownerId: "user-123",
      };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as unknown as SelectRestaurant | undefined);

      const result = await getUserRestaurant();

      expect(result).toEqual(mockRestaurant);
    });

    it("should return null for unauthenticated user", async () => {
      vi.mocked(getAppUser).mockResolvedValue(null);

      const result = await getUserRestaurant();

      expect(result).toBeNull();
    });

    it("should return null if no restaurant found", async () => {
      vi.mocked(getAppUser).mockResolvedValue(mockOwner);

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(undefined);

      const result = await getUserRestaurant();

      expect(result).toBeNull();
    });
  });

  describe("getOrders", () => {
    it("should return orders for authenticated restaurant owner", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

      const mockRestaurant = {
        id: "rest-123",
        ownerId: "user-123",
      };

      const mockOrders = [
        { id: "order-1", restaurantId: "rest-123", status: "NEW", items: [] },
        { id: "order-2", restaurantId: "rest-123", status: "PREPARING", items: [] },
      ];

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as unknown as SelectRestaurant | undefined);
      vi.mocked(db.query.orders.findMany).mockResolvedValue(mockOrders as unknown as SelectOrder[]);

      const result = await getOrders();

      expect(result).toEqual(mockOrders);
    });

    it("should throw error for unauthenticated user", async () => {
      vi.mocked(requireAuth).mockRejectedValue(new Error("Non autorisé"));

      await expect(getOrders()).rejects.toThrow("Non autorisé");
    });

    it("should return empty array if no restaurant found", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(undefined);

      const result = await getOrders();

      expect(result).toEqual([]);
    });
  });

  describe("updateOrderStatus", () => {
    it("should update order status successfully", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

      const mockRestaurant = { id: "rest-123", ownerId: "user-123" };
      const mockOrder = { id: "order-123", restaurantId: "rest-123", status: "NEW" };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as unknown as SelectRestaurant | undefined);
      vi.mocked(db.query.orders.findFirst).mockResolvedValue(mockOrder as unknown as SelectOrder | undefined);

      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      vi.mocked(db.update).mockReturnValue(updateMock() as unknown as ReturnType<typeof db.update>);

      const result = await updateOrderStatus("order-123", "PREPARING");

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw error for unauthenticated user", async () => {
      vi.mocked(requireAuth).mockRejectedValue(new Error("Non autorisé"));

      await expect(updateOrderStatus("order-123", "PREPARING")).rejects.toThrow("Non autorisé");
    });

    it("should throw error if restaurant not found", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(undefined);

      await expect(updateOrderStatus("order-123", "PREPARING")).rejects.toThrow("Restaurant non trouvé");
    });

    it("should throw error if order not found", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

      const mockRestaurant = { id: "rest-123", ownerId: "user-123" };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as unknown as SelectRestaurant | undefined);
      vi.mocked(db.query.orders.findFirst).mockResolvedValue(undefined);

      await expect(updateOrderStatus("order-123", "PREPARING")).rejects.toThrow("Commande non trouvée");
    });
  });
});
