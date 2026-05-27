// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";
import { switchRestaurant, getSelectedRestaurantId } from "@/features/restaurant/switch-actions";
import { getUserRestaurants } from "@/lib/auth";
import { cookies } from "next/headers";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getUserRestaurants: vi.fn(),
  RESTAURANT_COOKIE: "yallo_restaurant_id",
}));

const mockRestaurants = [
  { id: "rest-1", name: "Restaurant A" },
  { id: "rest-2", name: "Restaurant B" },
];

describe("switchRestaurant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets the cookie when restaurant belongs to the org", async () => {
    const mockSet = vi.fn();
    vi.mocked(cookies).mockResolvedValue({ get: vi.fn(), set: mockSet } as unknown as Awaited<ReturnType<typeof cookies>>);
    vi.mocked(getUserRestaurants).mockResolvedValue(mockRestaurants as unknown as Awaited<ReturnType<typeof getUserRestaurants>>);

    await switchRestaurant("rest-1");

    expect(mockSet).toHaveBeenCalledWith(
      "yallo_restaurant_id",
      "rest-1",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" })
    );
  });

  it("does nothing when restaurant does not belong to the org", async () => {
    const mockSet = vi.fn();
    vi.mocked(cookies).mockResolvedValue({ get: vi.fn(), set: mockSet } as unknown as unknown as Awaited<ReturnType<typeof cookies>>);
    vi.mocked(getUserRestaurants).mockResolvedValue(mockRestaurants as unknown as Awaited<ReturnType<typeof getUserRestaurants>>);

    await switchRestaurant("rest-unauthorized");

    expect(mockSet).not.toHaveBeenCalled();
  });

  it("does nothing when org is not found", async () => {
    const mockSet = vi.fn();
    vi.mocked(cookies).mockResolvedValue({ get: vi.fn(), set: mockSet } as unknown as unknown as Awaited<ReturnType<typeof cookies>>);
    vi.mocked(getUserRestaurants).mockResolvedValue([]);

    await switchRestaurant("rest-1");

    expect(mockSet).not.toHaveBeenCalled();
  });
});

describe("getSelectedRestaurantId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the restaurant id from cookie", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "rest-2" }),
      set: vi.fn(),
    } as unknown as unknown as Awaited<ReturnType<typeof cookies>>);

    const result = await getSelectedRestaurantId();

    expect(result).toBe("rest-2");
  });

  it("returns null when no cookie is set", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
    } as unknown as unknown as Awaited<ReturnType<typeof cookies>>);

    const result = await getSelectedRestaurantId();

    expect(result).toBeNull();
  });
});

