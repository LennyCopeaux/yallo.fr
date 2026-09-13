// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCallUsageForCurrentPeriod } from "@/features/billing/usage-actions";
import { db } from "@/db";
import { getUserOrganization } from "@/lib/auth";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  getUserOrganization: vi.fn(),
}));

const mockOrg = {
  id: "org-1",
  name: "Mon Org",
  ownerId: "user-1",
  billingStartDate: null,
  stripeCurrentPeriodEnd: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripeSubscriptionStatus: null,
  stripePriceId: null,
  isActive: true,
  status: "active",
  manualAccessEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  restaurants: [],
};

function setupDbSelect(totalSeconds: number | null, callCount: number) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([{ totalSeconds, callCount }]),
  };
  vi.mocked(db.select).mockReturnValue(chain as unknown as ReturnType<typeof db.select>);
}

describe("getCallUsageForCurrentPeriod", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when no organization found", async () => {
    vi.mocked(getUserOrganization).mockResolvedValue(null);

    const result = await getCallUsageForCurrentPeriod();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });

  it("returns zero usage when no calls exist", async () => {
    vi.mocked(getUserOrganization).mockResolvedValue(mockOrg);
    setupDbSelect(null, 0);

    const result = await getCallUsageForCurrentPeriod();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.minutesUsed).toBe(0);
      expect(result.data.callCount).toBe(0);
      expect(result.data.estimatedCostCents).toBe(0);
    }
  });

  it("calculates minutes correctly (rounds up to nearest minute)", async () => {
    vi.mocked(getUserOrganization).mockResolvedValue(mockOrg);

    setupDbSelect(125, 5);

    const result = await getCallUsageForCurrentPeriod();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.minutesUsed).toBe(3);
      expect(result.data.callCount).toBe(5);
      expect(result.data.estimatedCostCents).toBe(3 * result.data.callRateCentsPerMinute);
    }
  });

  it("calculates period start from first of month when no billingStartDate", async () => {
    vi.mocked(getUserOrganization).mockResolvedValue(mockOrg);
    setupDbSelect(0, 0);

    const result = await getCallUsageForCurrentPeriod();

    expect(result.success).toBe(true);
    if (result.success) {
      const now = new Date();
      expect(result.data.periodStart.getFullYear()).toBe(now.getFullYear());
      expect(result.data.periodStart.getMonth()).toBe(now.getMonth());
      expect(result.data.periodStart.getDate()).toBe(1);
    }
  });

  it("uses billingStartDate to compute period start anniversary", async () => {
    vi.mocked(getUserOrganization).mockResolvedValue({ ...mockOrg, billingStartDate: "2025-01-15T00:00:00.000Z" });
    setupDbSelect(3600, 10);

    const result = await getCallUsageForCurrentPeriod();

    expect(result.success).toBe(true);
    if (result.success) {

      expect(result.data.periodStart.getDate()).toBe(15);
      expect(result.data.minutesUsed).toBe(60);
    }
  });

  it("returns periodEnd from stripeCurrentPeriodEnd when available", async () => {
    const endDate = new Date("2026-07-15T00:00:00.000Z");
    vi.mocked(getUserOrganization).mockResolvedValue({
      ...mockOrg,
      stripeCurrentPeriodEnd: endDate,
    });
    setupDbSelect(0, 0);

    const result = await getCallUsageForCurrentPeriod();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.periodEnd).toEqual(endDate);
    }
  });

  it("returns callRateCentsPerMinute as positive number", async () => {
    vi.mocked(getUserOrganization).mockResolvedValue(mockOrg);
    setupDbSelect(60, 1);

    const result = await getCallUsageForCurrentPeriod();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.callRateCentsPerMinute).toBeGreaterThan(0);
    }
  });
});
