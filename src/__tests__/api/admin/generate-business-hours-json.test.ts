import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/admin/restaurants/[id]/generate-business-hours-json/route";
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
}));

describe("GET /api/admin/restaurants/[id]/generate-business-hours-json", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as unknown as Awaited<ReturnType<typeof auth>>);

    const request = new Request("http://localhost/api/admin/restaurants/test-id/generate-business-hours-json");
    const response = await GET(request, { params: Promise.resolve({ id: "test-id" }) });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("should return 403 if user is not admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", role: "OWNER" },
    } as unknown as Awaited<ReturnType<typeof auth>>);

    const request = new Request("http://localhost/api/admin/restaurants/test-id/generate-business-hours-json");
    const response = await GET(request, { params: Promise.resolve({ id: "test-id" }) });

    expect(response.status).toBe(403);
  });

  it("should return business hours JSON for admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", role: "ADMIN" },
    } as unknown as Awaited<ReturnType<typeof auth>>);

    const mockRestaurant = {
      businessHours: JSON.stringify({
        timezone: "Europe/Paris",
        schedule: { monday: { open: "10:00", close: "22:00" } },
      }),
    };

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockRestaurant]),
        }),
      }),
    } as never);

    const request = new Request("http://localhost/api/admin/restaurants/test-id/generate-business-hours-json");
    const response = await GET(request, { params: Promise.resolve({ id: "test-id" }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("businessHoursJson");
  });
});
