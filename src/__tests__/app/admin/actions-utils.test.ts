import { describe, it, expect } from "vitest";
import { randomBytes } from "crypto";

function generateSecureString(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(bytes[i] % chars.length);
  }
  return result;
}

function generateTempPassword(): string {
  return generateSecureString(12);
}

function generateResetToken(): string {
  return generateSecureString(32);
}

describe("Admin Actions Utils", () => {
  describe("generateTempPassword", () => {
    it("should generate 12 character password", () => {
      const password = generateTempPassword();
      expect(password.length).toBe(12);
    });

    it("should only contain allowed characters", () => {
      const allowedChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
      const password = generateTempPassword();
      
      for (const char of password) {
        expect(allowedChars.includes(char)).toBe(true);
      }
    });

    it("should generate different passwords each time", () => {
      const password1 = generateTempPassword();
      const password2 = generateTempPassword();
      expect(password1).not.toBe(password2);
    });
  });

  describe("generateResetToken", () => {
    it("should generate 32 character token", () => {
      const token = generateResetToken();
      expect(token.length).toBe(32);
    });

    it("should only contain allowed characters", () => {
      const allowedChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
      const token = generateResetToken();
      
      for (const char of token) {
        expect(allowedChars.includes(char)).toBe(true);
      }
    });

    it("should generate different tokens each time", () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();
      expect(token1).not.toBe(token2);
    });
  });
});
