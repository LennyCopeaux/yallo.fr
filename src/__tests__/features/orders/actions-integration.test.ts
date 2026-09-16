// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserRestaurant, getOrders, updateOrderStatus } from "@/features/orders/actions";
import { db } from "@/db";
import { getAccessibleRestaurant, requireAuth } from "@/lib/auth";
import { applyAutoRush } from "@/lib/services/auto-rush";
import { trySendOrderReadySms } from "@/lib/services/twilio-sms";
import type { SelectOrder } from "@/db/schema";

vi.mock("@/db", () => ({
  db: {
    query: {
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
  getAccessibleRestaurant: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/subscription-access", () => ({
  requirePaidSubscription: vi.fn().mockResolvedValue({
    hasAccess: true,
    reason: "paid",
    status: "active",
    currentPeriodEnd: null,
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// `after()` exécute le SMS et l'auto-rush une fois la réponse envoyée ;
// dans les tests on l'exécute tout de suite pour couvrir le code.
vi.mock("next/server", () => ({
  after: vi.fn((fn: () => Promise<void>) => fn()),
}));

vi.mock("@/lib/services/auto-rush", () => ({
  applyAutoRush: vi.fn().mockResolvedValue("NORMAL"),
}));

vi.mock("@/lib/services/twilio-sms", () => ({
  trySendOrderReadySms: vi.fn().mockResolvedValue(true),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
  }),
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
      const mockRestaurant = {
        id: "rest-123",
        name: "Test Restaurant",
        ownerId: "user-123",
      };

      vi.mocked(getAccessibleRestaurant).mockResolvedValue(mockRestaurant as unknown as Awaited<ReturnType<typeof getAccessibleRestaurant>>);

      const result = await getUserRestaurant();

      expect(result).toEqual(mockRestaurant);
    });

    it("should return null for unauthenticated user", async () => {
      vi.mocked(getAccessibleRestaurant).mockResolvedValue(null);

      const result = await getUserRestaurant();

      expect(result).toBeNull();
    });

    it("should return null if no restaurant found", async () => {
      vi.mocked(getAccessibleRestaurant).mockResolvedValue(null);

      const result = await getUserRestaurant();

      expect(result).toBeNull();
    });
  });

  describe("getOrders", () => {
    it("should return orders for authenticated restaurant owner", async () => {
      const mockRestaurant = {
        id: "rest-123",
        ownerId: "user-123",
      };

      const mockOrders = [
        { id: "order-1", restaurantId: "rest-123", status: "NEW", items: [] },
        { id: "order-2", restaurantId: "rest-123", status: "PREPARING", items: [] },
      ];

      vi.mocked(getAccessibleRestaurant).mockResolvedValue(mockRestaurant as unknown as Awaited<ReturnType<typeof getAccessibleRestaurant>>);
      vi.mocked(db.query.orders.findMany).mockResolvedValue(mockOrders as unknown as SelectOrder[]);

      const result = await getOrders();

      expect(result).toEqual(mockOrders);
    });

    it("should return empty array for unauthenticated user", async () => {
      vi.mocked(getAccessibleRestaurant).mockResolvedValue(null);

      const result = await getOrders();

      expect(result).toEqual([]);
    });

    it("should return empty array if no restaurant found", async () => {
      vi.mocked(getAccessibleRestaurant).mockResolvedValue(null);

      const result = await getOrders();

      expect(result).toEqual([]);
    });
  });

  describe("updateOrderStatus", () => {
    const mockRestaurant = {
      id: "rest-123",
      ownerId: "user-123",
      name: "Resto",
      smsReadyEnabled: false,
      twilioPhoneNumber: "+33939035299",
    };

    function mockUpdateReturning(rows: unknown[]) {
      const returning = vi.fn().mockResolvedValue(rows);
      const where = vi.fn().mockReturnValue({ returning, then: (r: (v: unknown) => void) => r(undefined) });
      const set = vi.fn().mockReturnValue({ where });
      vi.mocked(db.update).mockReturnValue({ set } as unknown as ReturnType<typeof db.update>);
      return { set, where, returning };
    }

    it("updates in a single query scoped to the restaurant and recomputes auto-rush after the response", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);
      vi.mocked(getAccessibleRestaurant).mockResolvedValue(mockRestaurant as unknown as Awaited<ReturnType<typeof getAccessibleRestaurant>>);
      const { set, returning } = mockUpdateReturning([
        { id: "order-123", orderNumber: "#1", customerName: "Paul", customerPhone: null, readyNotifiedAt: null },
      ]);

      const result = await updateOrderStatus("order-123", "PREPARING");

      expect(result.success).toBe(true);
      expect(db.query.orders.findFirst).not.toHaveBeenCalled();
      expect(set).toHaveBeenCalledWith(expect.objectContaining({ status: "PREPARING" }));
      expect(returning).toHaveBeenCalledTimes(1);
      expect(applyAutoRush).toHaveBeenCalledWith(mockRestaurant);
      expect(trySendOrderReadySms).not.toHaveBeenCalled();
    });

    it("sends the ready SMS once when the order becomes READY and the option is on", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);
      vi.mocked(getAccessibleRestaurant).mockResolvedValue({
        ...mockRestaurant,
        smsReadyEnabled: true,
      } as unknown as Awaited<ReturnType<typeof getAccessibleRestaurant>>);
      mockUpdateReturning([
        { id: "order-123", orderNumber: "#1", customerName: "Paul", customerPhone: "+33612345678", readyNotifiedAt: null },
      ]);

      await updateOrderStatus("order-123", "READY");

      expect(trySendOrderReadySms).toHaveBeenCalledWith(
        expect.objectContaining({ toRaw: "+33612345678", orderNumber: "#1", customerName: "Paul" })
      );
    });

    it("does not resend the ready SMS when it was already sent", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);
      vi.mocked(getAccessibleRestaurant).mockResolvedValue({
        ...mockRestaurant,
        smsReadyEnabled: true,
      } as unknown as Awaited<ReturnType<typeof getAccessibleRestaurant>>);
      mockUpdateReturning([
        { id: "order-123", orderNumber: "#1", customerName: "Paul", customerPhone: "+33612345678", readyNotifiedAt: new Date() },
      ]);

      await updateOrderStatus("order-123", "READY");

      expect(trySendOrderReadySms).not.toHaveBeenCalled();
    });

    it("should throw error for unauthenticated user", async () => {
      vi.mocked(requireAuth).mockRejectedValue(new Error("Non autorisé"));

      await expect(updateOrderStatus("order-123", "PREPARING")).rejects.toThrow("Non autorisé");
    });

    it("should throw error if restaurant not found", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);
      vi.mocked(getAccessibleRestaurant).mockResolvedValue(null);

      await expect(updateOrderStatus("order-123", "PREPARING")).rejects.toThrow("Restaurant non trouvé");
    });

    it("should throw error if the order does not belong to the restaurant", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);
      vi.mocked(getAccessibleRestaurant).mockResolvedValue(mockRestaurant as unknown as Awaited<ReturnType<typeof getAccessibleRestaurant>>);
      mockUpdateReturning([]);

      await expect(updateOrderStatus("order-123", "PREPARING")).rejects.toThrow("Commande non trouvée");
      expect(applyAutoRush).not.toHaveBeenCalled();
    });
  });
});
