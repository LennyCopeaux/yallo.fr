import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPricingPlans, updatePricingPlan } from "@/app/(admin)/admin/settings/actions";
import { db } from "@/db";
import { pricingPlans } from "@/db/schema";
import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Pricing Plans Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPricingPlans", () => {
    it("should return existing plans sorted by order", async () => {
      const mockPlans = [
        { id: "1", name: "essential", subtitle: "Standard", target: "Test", monthlyPrice: 14900, setupFee: null, commissionRate: 0, includedMinutes: 400, overflowPricePerMinute: 25, hubrise: true, popular: true, createdAt: new Date(), updatedAt: new Date() },
        { id: "2", name: "starter", subtitle: "Test", target: "Test", monthlyPrice: 2900, setupFee: 9900, commissionRate: 7, includedMinutes: null, overflowPricePerMinute: null, hubrise: false, popular: false, createdAt: new Date(), updatedAt: new Date() },
        { id: "3", name: "infinity", subtitle: "Volume", target: "Test", monthlyPrice: 34900, setupFee: null, commissionRate: 0, includedMinutes: 1200, overflowPricePerMinute: 20, hubrise: true, popular: false, createdAt: new Date(), updatedAt: new Date() },
      ];

      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue(mockPlans),
      });
      vi.mocked(db.select).mockReturnValue(selectMock() as any);

      const result = await getPricingPlans();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("starter");
      expect(result[1].name).toBe("essential");
      expect(result[2].name).toBe("infinity");
    });

    it("should create default plans if none exist", async () => {
      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue([]),
      });
      const insertMock = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([]),
      });
      const selectAfterInsertMock = vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue([
          { id: "1", name: "starter", subtitle: "Test", target: "Pour tester l'IA sans risque", monthlyPrice: 2900, setupFee: 9900, commissionRate: 7, includedMinutes: null, overflowPricePerMinute: null, hubrise: false, popular: false, createdAt: new Date(), updatedAt: new Date() },
        { id: "2", name: "essential", subtitle: "Standard", target: "Pour les restaurants en croissance", monthlyPrice: 14900, setupFee: null, commissionRate: 0, includedMinutes: 400, overflowPricePerMinute: 25, hubrise: true, popular: true, createdAt: new Date(), updatedAt: new Date() },
          { id: "3", name: "infinity", subtitle: "Volume", target: "Pour les gros volumes d'appels", monthlyPrice: 34900, setupFee: null, commissionRate: 0, includedMinutes: 1200, overflowPricePerMinute: 20, hubrise: true, popular: false, createdAt: new Date(), updatedAt: new Date() },
        ]),
      });

      vi.mocked(db.select)
        .mockReturnValueOnce(selectMock() as any)
        .mockReturnValueOnce(selectAfterInsertMock() as any);
      vi.mocked(db.insert).mockReturnValue(insertMock() as any);

      const result = await getPricingPlans();

      expect(db.insert).toHaveBeenCalled();
      expect(result).toHaveLength(3);
    });

    it("should return empty array on error", async () => {
      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockRejectedValue(new Error("DB Error")),
      });
      vi.mocked(db.select).mockReturnValue(selectMock() as any);

      const result = await getPricingPlans();

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("updatePricingPlan", () => {
    it("should update plan successfully", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", role: "ADMIN", email: "admin@test.com" },
      } as any);

      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      vi.mocked(db.update).mockReturnValue(updateMock() as any);

      const result = await updatePricingPlan({
        name: "starter",
        subtitle: "Updated",
        target: "Updated target",
        monthlyPrice: 3000,
        setupFee: 10000,
        commissionRate: 8,
        includedMinutes: null,
        overflowPricePerMinute: null,
        hubrise: false,
        popular: false,
      });

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });

    it("should return error for non-admin users", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", role: "OWNER", email: "owner@test.com" },
      } as any);

      const result = await updatePricingPlan({
        name: "starter",
        subtitle: "Test",
        target: "Test",
        monthlyPrice: 3000,
        setupFee: null,
        commissionRate: null,
        includedMinutes: null,
        overflowPricePerMinute: null,
        hubrise: false,
        popular: false,
      });

      expect(result.success).toBe(false);
    });

    it("should return error for invalid data", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", role: "ADMIN", email: "admin@test.com" },
      } as any);

      const result = await updatePricingPlan({
        name: "starter",
        subtitle: "",
        target: "",
        monthlyPrice: -1,
        setupFee: null,
        commissionRate: null,
        includedMinutes: null,
        overflowPricePerMinute: null,
        hubrise: false,
        popular: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle database errors", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", role: "ADMIN", email: "admin@test.com" },
      } as any);

      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error("DB Error")),
        }),
      });
      vi.mocked(db.update).mockReturnValue(updateMock() as any);

      const result = await updatePricingPlan({
        name: "starter",
        subtitle: "Test",
        target: "Test",
        monthlyPrice: 3000,
        setupFee: null,
        commissionRate: null,
        includedMinutes: null,
        overflowPricePerMinute: null,
        hubrise: false,
        popular: false,
      });

      expect(result.success).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
