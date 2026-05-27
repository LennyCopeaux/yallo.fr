// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserOrganization } from "@/lib/auth";
import { db } from "@/db";

const mockUserChain = {
  from: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

const mockMembershipsChain = {
  from: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  where: vi.fn(),
};

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    query: {
      organizations: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "supabase-auth-1" } },
      }),
    },
  }),
}));

const mockUser = {
  id: "user-1",
  authUserId: "supabase-auth-1",
  email: "owner@example.com",
  firstName: "Jean",
  lastName: "Dupont",
  role: "OWNER" as const,
  createdAt: new Date(),
};

const mockOrgMembership = {
  id: "org-1",
  name: "Kebab Palace Group",
  ownerId: "user-1",
  isActive: true,
  stripeSubscriptionStatus: null,
  stripeCurrentPeriodEnd: null,
  createdAt: new Date(),
};

const mockOrgWithRestaurants = {
  id: "org-1",
  name: "Kebab Palace Group",
  ownerId: "user-1",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripeSubscriptionStatus: null,
  stripePriceId: null,
  stripeCurrentPeriodEnd: null,
  billingStartDate: null,
  isActive: true,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  restaurants: [
    { id: "rest-1", name: "Kebab Palace Paris", ownerId: "user-1", organizationId: "org-1", isActive: true },
    { id: "rest-2", name: "Kebab Palace Lyon", ownerId: "user-1", organizationId: "org-1", isActive: true },
  ],
};

describe("getUserOrganization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore chain behaviors after clearAllMocks
    mockUserChain.from.mockReturnThis();
    mockUserChain.innerJoin.mockReturnThis();
    mockUserChain.where.mockReturnThis();
    mockUserChain.limit.mockResolvedValue([mockUser]);
    mockMembershipsChain.from.mockReturnThis();
    mockMembershipsChain.innerJoin.mockReturnThis();
    mockMembershipsChain.where.mockResolvedValue([mockOrgMembership]);
    vi.mocked(db.select)
      .mockReturnValueOnce(mockUserChain as unknown as ReturnType<typeof db.select>)
      .mockReturnValueOnce(mockMembershipsChain as unknown as ReturnType<typeof db.select>);
  });

  it("returns null when user is not authenticated (getUser returns null)", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getUserOrganization();
    expect(result).toBeNull();
  });

  it("returns null when user has no organization", async () => {
    mockMembershipsChain.where.mockResolvedValue([]);

    const result = await getUserOrganization();

    expect(result).toBeNull();
  });

  it("returns the organization with restaurants when found", async () => {
    vi.mocked(db.query.organizations.findFirst).mockResolvedValue(
      mockOrgWithRestaurants as Awaited<ReturnType<typeof db.query.organizations.findFirst>>
    );

    const result = await getUserOrganization();

    expect(result).not.toBeNull();
    expect(result?.id).toBe("org-1");
    expect(result?.restaurants).toHaveLength(2);
  });

  it("queries organizations with restaurants relation", async () => {
    vi.mocked(db.query.organizations.findFirst).mockResolvedValue(
      mockOrgWithRestaurants as Awaited<ReturnType<typeof db.query.organizations.findFirst>>
    );

    await getUserOrganization();

    expect(db.query.organizations.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        with: expect.objectContaining({ restaurants: true }),
      })
    );
  });
});

