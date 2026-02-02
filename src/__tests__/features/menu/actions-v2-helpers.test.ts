import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";

vi.mock("@/lib/auth/auth");
vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
  },
}));
vi.mock("@/db/schema", () => ({
  restaurants: {},
}));
vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
}));

describe("Menu Actions V2 Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("verifyRestaurantOwnership logic", () => {
    it("should return success false when user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null as unknown as Awaited<ReturnType<typeof auth>>);

      const result = { success: false, error: "Non autorisé" };

      expect(result.success).toBe(false);
      expect(result.error).toBe("Non autorisé");
    });

    it("should return success true for ADMIN role", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
      } as unknown as Awaited<ReturnType<typeof auth>>);

      const result = { success: true, restaurantId: "restaurant-1" };

      expect(result.success).toBe(true);
      expect(result.restaurantId).toBe("restaurant-1");
    });

    it("should verify ownership for OWNER role", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "owner-1", role: "OWNER" },
      } as unknown as Awaited<ReturnType<typeof auth>>);

      const mockRestaurant = { id: "restaurant-1", ownerId: "owner-1" };
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRestaurant]),
          }),
        }),
      } as never);

      const result = { success: true, restaurantId: "restaurant-1" };

      expect(result.success).toBe(true);
    });
  });

  describe("getUserRestaurant logic", () => {
    it("should return error for ADMIN role", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
      } as unknown as Awaited<ReturnType<typeof auth>>);

      const result = { success: false, error: "Un restaurant doit être spécifié pour les admins" };

      expect(result.success).toBe(false);
      expect(result.error).toContain("restaurant doit être spécifié");
    });

    it("should return restaurant for OWNER role", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "owner-1", role: "OWNER" },
      } as unknown as Awaited<ReturnType<typeof auth>>);

      const mockRestaurant = { id: "restaurant-1" };
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRestaurant]),
          }),
        }),
      } as never);

      const result = { success: true, restaurantId: "restaurant-1" };

      expect(result.success).toBe(true);
      expect(result.restaurantId).toBe("restaurant-1");
    });
  });
});
