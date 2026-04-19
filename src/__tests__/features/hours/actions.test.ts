import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBusinessHours, updateBusinessHours } from "@/features/hours/actions";
import { db } from "@/db";
import { requireAuth } from "@/lib/auth";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockOwner = {
  id: "user-123",
  authUserId: "auth-123",
  email: "owner@test.com",
  firstName: null,
  lastName: null,
  role: "OWNER" as const,
  createdAt: new Date(),
};

const mockAdmin = {
  id: "admin-123",
  authUserId: "auth-admin",
  email: "admin@test.com",
  firstName: null,
  lastName: null,
  role: "ADMIN" as const,
  createdAt: new Date(),
};

describe("Business Hours Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBusinessHours", () => {
    it("should return business hours for authenticated owner", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

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
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

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

    it("should throw error for unauthenticated user", async () => {
      vi.mocked(requireAuth).mockRejectedValue(new Error("Non autorisé"));

      await expect(getBusinessHours()).rejects.toThrow("Non autorisé");
    });

    it("should return error for admin without restaurant", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockAdmin);

      const result = await getBusinessHours();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Un restaurant doit être spécifié pour les admins");
    });

    it("should return error if restaurant not found", async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

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
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

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
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

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
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

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
      vi.mocked(requireAuth).mockResolvedValue(mockOwner);

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

    it("should throw error for unauthenticated user", async () => {
      vi.mocked(requireAuth).mockRejectedValue(new Error("Non autorisé"));

      const formData = new FormData();
      formData.append("businessHours", JSON.stringify({ schedule: {} }));

      await expect(updateBusinessHours(formData)).rejects.toThrow("Non autorisé");
    });
  });
});
