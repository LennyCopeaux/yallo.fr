import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserRestaurant, getOrders, updateOrderStatus, simulateOrder } from "@/features/orders/actions";
import { db } from "@/db";
import { auth } from "@/lib/auth/auth";
import type { Session } from "next-auth";
import type { SelectRestaurant, SelectOrder } from "@/db/schema";

type MockAuthSession = Session | null;
type MockRestaurant = Partial<SelectRestaurant> | undefined;
type MockOrder = Partial<SelectOrder> | undefined;
type MockUpdateBuilder = {
  set: () => {
    where: () => Promise<undefined>;
  };
};

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

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Orders Actions Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserRestaurant", () => {
    it("should return restaurant for authenticated user", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as MockAuthSession);

      const mockRestaurant = {
        id: "rest-123",
        name: "Test Restaurant",
        ownerId: "user-123",
      };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as MockRestaurant);

      const result = await getUserRestaurant();

      expect(result).toEqual(mockRestaurant);
    });

    it("should return null for unauthenticated user", async () => {
      vi.mocked(auth).mockResolvedValue(null as MockAuthSession);

      const result = await getUserRestaurant();

      expect(result).toBeNull();
    });

    it("should return null if no restaurant found", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as MockAuthSession);

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(undefined);

      const result = await getUserRestaurant();

      expect(result).toBeNull();
    });
  });

  describe("getOrders", () => {
    it("should return orders for authenticated restaurant owner", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as MockAuthSession);

      const mockRestaurant = {
        id: "rest-123",
        ownerId: "user-123",
      };

      const mockOrders = [
        { id: "order-1", restaurantId: "rest-123", status: "NEW", items: [] },
        { id: "order-2", restaurantId: "rest-123", status: "PREPARING", items: [] },
      ];

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as MockRestaurant);
      vi.mocked(db.query.orders.findMany).mockResolvedValue(mockOrders as MockOrder[]);

      const result = await getOrders();

      expect(result).toEqual(mockOrders);
    });

    it("should throw error for unauthenticated user", async () => {
      vi.mocked(auth).mockResolvedValue(null as MockAuthSession);

      await expect(getOrders()).rejects.toThrow("Non autorisé");
    });

    it("should return empty array if no restaurant found", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as MockAuthSession);

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(undefined);

      const result = await getOrders();

      expect(result).toEqual([]);
    });
  });

  describe("updateOrderStatus", () => {
    it("should update order status successfully", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as MockAuthSession);

      const mockRestaurant = { id: "rest-123", ownerId: "user-123" };
      const mockOrder = { id: "order-123", restaurantId: "rest-123", status: "NEW" };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as MockRestaurant);
      vi.mocked(db.query.orders.findFirst).mockResolvedValue(mockOrder as MockOrder);

      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      vi.mocked(db.update).mockReturnValue(updateMock() as unknown as MockUpdateBuilder);

      const result = await updateOrderStatus("order-123", "PREPARING");

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw error for unauthenticated user", async () => {
      vi.mocked(auth).mockResolvedValue(null as MockAuthSession);

      await expect(updateOrderStatus("order-123", "PREPARING")).rejects.toThrow("Non autorisé");
    });

    it("should throw error if restaurant not found", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as MockAuthSession);

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(undefined);

      await expect(updateOrderStatus("order-123", "PREPARING")).rejects.toThrow("Restaurant non trouvé");
    });

    it("should throw error if order not found", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as MockAuthSession);

      const mockRestaurant = { id: "rest-123", ownerId: "user-123" };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as MockRestaurant);
      vi.mocked(db.query.orders.findFirst).mockResolvedValue(undefined);

      await expect(updateOrderStatus("order-123", "PREPARING")).rejects.toThrow("Commande non trouvée");
    });
  });

  describe("simulateOrder", () => {
    it("should create simulated order successfully", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as MockAuthSession);

      const mockRestaurant = { id: "rest-123", ownerId: "user-123" };
      const mockOrder = { id: "order-123", orderNumber: "#1234" };

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(mockRestaurant as MockRestaurant);
      
      const insertMock = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockOrder]),
        }),
      });
      type MockInsertBuilderWithReturning = {
        values: () => {
          returning: () => Promise<Array<{ id: string; orderNumber: string }>>;
        };
      };
      type MockInsertBuilderSimple = {
        values: () => Promise<undefined>;
      };
      vi.mocked(db.insert).mockReturnValueOnce(insertMock() as unknown as MockInsertBuilderWithReturning).mockReturnValueOnce({
        values: vi.fn().mockResolvedValue(undefined),
      } as unknown as MockInsertBuilderSimple);

      const result = await simulateOrder();

      expect(result.success).toBe(true);
      expect(result.orderNumber).toBeDefined();
      expect(db.insert).toHaveBeenCalledTimes(2);
    });

    it("should throw error for unauthenticated user", async () => {
      vi.mocked(auth).mockResolvedValue(null as MockAuthSession);

      await expect(simulateOrder()).rejects.toThrow("Non autorisé");
    });

    it("should throw error if restaurant not found", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123", email: "test@test.com" },
      } as MockAuthSession);

      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue(undefined);

      await expect(simulateOrder()).rejects.toThrow("Restaurant non trouvé");
    });
  });
});
