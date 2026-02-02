import { describe, it, expect, beforeEach } from "vitest";
import {
  rateLimit,
  getRateLimitIdentifier,
  cleanupExpiredRecords,
} from "@/lib/rate-limit";
import { NextRequest } from "next/server";

describe("Rate Limiting", () => {
  beforeEach(() => {
    cleanupExpiredRecords();
  });

  describe("rateLimit", () => {
    it("should allow requests within limit", () => {
      const identifier = "test-user-1";
      expect(rateLimit(identifier, 5, 60000)).toBe(true);
      expect(rateLimit(identifier, 5, 60000)).toBe(true);
      expect(rateLimit(identifier, 5, 60000)).toBe(true);
    });

    it("should block requests exceeding limit", () => {
      const identifier = "test-user-2";
      // Make 5 requests (limit)
      for (let i = 0; i < 5; i++) {
        expect(rateLimit(identifier, 5, 60000)).toBe(true);
      }
      // 6th request should be blocked
      expect(rateLimit(identifier, 5, 60000)).toBe(false);
    });

    it("should reset after window expires", async () => {
      const identifier = "test-user-3";
      // Use a very short window for testing
      const shortWindow = 50; // 50ms

      // Exhaust the limit
      for (let i = 0; i < 3; i++) {
        rateLimit(identifier, 3, shortWindow);
      }
      expect(rateLimit(identifier, 3, shortWindow)).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Should be allowed again
      expect(rateLimit(identifier, 3, shortWindow)).toBe(true);
    });

    it("should handle different identifiers separately", () => {
      const identifier1 = "user-a";
      const identifier2 = "user-b";

      // Exhaust limit for user-a
      for (let i = 0; i < 2; i++) {
        rateLimit(identifier1, 2, 60000);
      }
      expect(rateLimit(identifier1, 2, 60000)).toBe(false);

      // user-b should still be allowed
      expect(rateLimit(identifier2, 2, 60000)).toBe(true);
    });

    it("should use default values when not specified", () => {
      const identifier = "test-default";
      // Default is 10 requests per minute
      for (let i = 0; i < 10; i++) {
        expect(rateLimit(identifier)).toBe(true);
      }
      expect(rateLimit(identifier)).toBe(false);
    });
  });

  describe("getRateLimitIdentifier", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const req = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          "x-forwarded-for": "192.168.1.1, 10.0.0.1",
        },
      });
      const identifier = getRateLimitIdentifier(req);
      expect(identifier).toBe("192.168.1.1:/api/test");
    });

    it("should extract IP from x-real-ip header", () => {
      const req = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          "x-real-ip": "10.0.0.5",
        },
      });
      const identifier = getRateLimitIdentifier(req);
      expect(identifier).toBe("10.0.0.5:/api/test");
    });

    it("should use unknown when no IP headers present", () => {
      const req = new NextRequest("http://localhost:3000/api/test");
      const identifier = getRateLimitIdentifier(req);
      expect(identifier).toBe("unknown:/api/test");
    });

    it("should include path in identifier", () => {
      const req = new NextRequest("http://localhost:3000/api/users/create", {
        headers: {
          "x-forwarded-for": "192.168.1.1",
        },
      });
      const identifier = getRateLimitIdentifier(req);
      expect(identifier).toContain("/api/users/create");
    });
  });

  describe("cleanupExpiredRecords", () => {
    it("should remove expired records", async () => {
      const identifier = "cleanup-test";
      const shortWindow = 50;

      rateLimit(identifier, 5, shortWindow);

      await new Promise((resolve) => setTimeout(resolve, 60));

      cleanupExpiredRecords();

      expect(rateLimit(identifier, 1, shortWindow)).toBe(true);
    });
  });
});
