import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("Admin Actions Schemas", () => {
  const createUserSchema = z.object({
    email: z.string().email("Email invalide"),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    role: z.enum(["ADMIN", "OWNER"]),
  });

  const createRestaurantSchema = z.object({
    name: z.string().min(2, "Nom trop court").max(100, "Nom trop long"),
    phoneNumber: z.string().min(10, "Numéro invalide"),
    ownerId: z.string().uuid("ID propriétaire invalide"),
    address: z.string().optional(),
  });

  describe("createUserSchema", () => {
    it("should validate valid user data", () => {
      const validData = {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "OWNER" as const,
      };

      const result = createUserSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("test@example.com");
        expect(result.data.role).toBe("OWNER");
      }
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        role: "OWNER" as const,
      };

      const result = createUserSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should accept optional firstName and lastName", () => {
      const minimalData = {
        email: "test@example.com",
        role: "OWNER" as const,
      };

      const result = createUserSchema.safeParse(minimalData);

      expect(result.success).toBe(true);
    });
  });

  describe("createRestaurantSchema", () => {
    it("should validate valid restaurant data", () => {
      const validData = {
        name: "Restaurant Test",
        phoneNumber: "+33123456789",
        ownerId: "123e4567-e89b-12d3-a456-426614174000",
        address: "123 Rue Test",
      };

      const result = createRestaurantSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Restaurant Test");
      }
    });

    it("should reject name too short", () => {
      const invalidData = {
        name: "A",
        phoneNumber: "+33123456789",
        ownerId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = createRestaurantSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject invalid UUID", () => {
      const invalidData = {
        name: "Restaurant Test",
        phoneNumber: "+33123456789",
        ownerId: "invalid-uuid",
      };

      const result = createRestaurantSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});
