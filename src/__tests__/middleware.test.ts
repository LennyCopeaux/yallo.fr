import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { middleware } from "../../middleware";

vi.mock("@/lib/supabase/middleware", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/middleware";

const mockCreateClient = vi.mocked(createClient);

function makeRequest(
  pathname: string,
  host = "app.localhost:3000"
): NextRequest {
  return new NextRequest(new URL(`http://${host}${pathname}`), {
    headers: { host },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockUser(role?: string): any {
  return {
    id: "user-123",
    aud: "authenticated",
    created_at: new Date().toISOString(),
    app_metadata: { role },
    user_metadata: {},
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateClient.mockResolvedValue({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: {} as any,
    supabaseResponse: NextResponse.next(),
    user: null,
  });
});

describe("middleware", () => {
  describe("non-app domain", () => {
    it("passes through non-app routes on main domain", async () => {
      const req = makeRequest("/", "yallo.fr");
      const res = await middleware(req);
      expect(res.status).not.toBe(307);
    });

    it("redirects app-only routes from main domain to app domain", async () => {
      const req = makeRequest("/login", "yallo.fr");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });
  });

  describe("app domain - unauthenticated", () => {
    it("redirects root to /login when not logged in", async () => {
      const req = makeRequest("/");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });

    it("redirects protected dashboard to /login when not logged in", async () => {
      const req = makeRequest("/dashboard");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });

    it("redirects protected admin to /login when not logged in", async () => {
      const req = makeRequest("/admin");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });

    it("allows /login route when not logged in", async () => {
      const req = makeRequest("/login");
      const res = await middleware(req);
      expect(res.status).not.toBe(307);
    });
  });

  describe("app domain - authenticated user (RESTAURANT role)", () => {
    beforeEach(() => {
      mockCreateClient.mockResolvedValue({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase: {} as any,
        supabaseResponse: NextResponse.next(),
        user: mockUser("RESTAURANT"),
      });
    });

    it("redirects root to /dashboard", async () => {
      const req = makeRequest("/");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/dashboard");
    });

    it("redirects /login to /dashboard when already logged in", async () => {
      const req = makeRequest("/login");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/dashboard");
    });

    it("redirects /admin routes to /dashboard for non-admin", async () => {
      const req = makeRequest("/admin");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/dashboard");
    });

    it("allows /dashboard routes", async () => {
      const req = makeRequest("/dashboard");
      const res = await middleware(req);
      expect(res.status).not.toBe(307);
    });
  });

  describe("app domain - authenticated ADMIN", () => {
    beforeEach(() => {
      mockCreateClient.mockResolvedValue({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase: {} as any,
        supabaseResponse: NextResponse.next(),
        user: mockUser("ADMIN"),
      });
    });

    it("redirects root to /admin for ADMIN role", async () => {
      const req = makeRequest("/");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/admin");
    });

    it("redirects /login to /admin when ADMIN already logged in", async () => {
      const req = makeRequest("/login");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/admin");
    });

    it("redirects /dashboard to /admin for ADMIN", async () => {
      const req = makeRequest("/dashboard");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/admin");
    });

    it("allows /admin routes for ADMIN", async () => {
      const req = makeRequest("/admin");
      const res = await middleware(req);
      expect(res.status).not.toBe(307);
    });
  });
});
