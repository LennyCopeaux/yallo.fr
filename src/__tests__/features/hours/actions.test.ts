import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import { getBusinessHours, updateBusinessHours } from "@/features/hours/actions";
import { db } from "@/db";
import { auth } from "@/lib/auth/auth";
import type { Session } from "next-auth";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Cast auth en mock typé pour éviter la confusion avec la surcharge NextMiddleware
const authMock = auth as unknown as MockedFunction<() => Promise<Session | null>>;

describe("Business Hours Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBusinessHours", () => {
    it("should return business hours for authenticated owner", async () => {
      authMock.mockResolvedValue({
        user: { id: "user-123", role: "OWNER", email: "owner@test.com" },
      } as unknown as Session);

      const mockHours = {
        timezone: "Europe/Paris",
        schedule: {
          monday: { open: "11:00", close: "22:00" },
        },
      };

      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ businessHours: JSON.stringify(mockHours) }]),
          }),
        }),
      });
      vi.mocked(db.select).mockReturnValue(selectMock() as unknown as ReturnType<typeof db.select>);

      const result = await getBusinessHours();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockHours);
    });

    it("should return default empty schedule if no hours set", async () => {
      authMock.mockResolvedValue({
        user: { id: "user-123", role: "OWNER", email: "owner@test.com" },
      } as unknown as Session);

      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ businessHours: null }]),
          }),
        }),
      });
      vi.mocked(db.select).mockReturnValue(selectMock() as unknown as ReturnType<typeof db.select>);

      const result = await getBusinessHours();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ timezone: "Europe/Paris", schedule: {} });
    });

    it("should return error for unauthenticated user", async () => {
      authMock.mockResolvedValue(null);

      const result = await getBusinessHours();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Non autorisé");
    });

    it("should return error for admin without restaurant", async () => {
      authMock.mockResolvedValue({
        user: { id: "admin-123", role: "ADMIN", email: "admin@test.com" },
      } as unknown as Session);

      const result = await getBusinessHours();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Un restaurant doit être spécifié pour les admins");
    });

    it("should return error if restaurant not found", async () => {
      authMock.mockResolvedValue({
        user: { id: "user-123", role: "OWNER", email: "owner@test.com" },
      } as unknown as Session);

      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });
      vi.mocked(db.select).mockReturnValue(selectMock() as unknown as ReturnType<typeof db.select>);

      const result = await getBusinessHours();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Aucun restaurant trouvé");
    });

    it("should handle invalid JSON gracefully", async () => {
      authMock.mockResolvedValue({
        user: { id: "user-123", role: "OWNER", email: "owner@test.com" },
      } as unknown as Session);

      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ businessHours: "invalid json" }]),
          }),
        }),
      });
      vi.mocked(db.select).mockReturnValue(selectMock() as unknown as ReturnType<typeof db.select>);

      const result = await getBusinessHours();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ timezone: "Europe/Paris", schedule: {} });
    });
  });

  describe("updateBusinessHours", () => {
    it("should update business hours successfully", async () => {
      authMock.mockResolvedValue({
        user: { id: "user-123", role: "OWNER", email: "owner@test.com" },
      } as unknown as Session);

      const mockHours = {
        timezone: "Europe/Paris",
        schedule: {
          monday: { open: "11:00", close: "22:00" },
        },
      };

      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "rest-123" }]),
          }),
        }),
      });
      const updateMock = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      vi.mocked(db.select).mockReturnValue(selectMock() as unknown as ReturnType<typeof db.select>);
      vi.mocked(db.update).mockReturnValue(updateMock() as unknown as ReturnType<typeof db.update>);

      const formData = new FormData();
      formData.append("businessHours", JSON.stringify(mockHours));

      const result = await updateBusinessHours(formData);

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });

    it("should return error for invalid form data", async () => {
      authMock.mockResolvedValue({
        user: { id: "user-123", role: "OWNER", email: "owner@test.com" },
      } as unknown as Session);

      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "rest-123" }]),
          }),
        }),
      });
      vi.mocked(db.select).mockReturnValue(selectMock() as unknown as ReturnType<typeof db.select>);

      const formData = new FormData();

      const result = await updateBusinessHours(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Horaires invalides");
    });

    it("should return error for invalid JSON", async () => {
      authMock.mockResolvedValue({
        user: { id: "user-123", role: "OWNER", email: "owner@test.com" },
      } as unknown as Session);

      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "rest-123" }]),
          }),
        }),
      });
      vi.mocked(db.select).mockReturnValue(selectMock() as unknown as ReturnType<typeof db.select>);

      const formData = new FormData();
      formData.append("businessHours", "invalid json");

      const result = await updateBusinessHours(formData);

      expect(result.success).toBe(false);
    });

    it("should return error for unauthenticated user", async () => {
      authMock.mockResolvedValue(null);

      const formData = new FormData();
      formData.append("businessHours", JSON.stringify({ schedule: {} }));

      const result = await updateBusinessHours(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Non autorisé");
    });
  });
});
