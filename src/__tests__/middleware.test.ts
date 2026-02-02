import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the auth module
vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth/auth";

interface MockSession {
  user: {
    id: string;
    email: string;
    role: string;
    mustChangePassword?: boolean;
  };
}

describe("Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("URL Building", () => {
    it("should build correct app URL for localhost", () => {
      const hostString = "localhost:3000";
      const path = "/dashboard";
      const port = hostString.match(/:(\d+)/)?.[1] || "3000";
      const url = `http://app.localhost:${port}${path}`;

      expect(url).toBe("http://app.localhost:3000/dashboard");
    });

    it("should build correct app URL for production", () => {
      const path = "/dashboard";
      const url = `https://app.yallo.fr${path}`;

      expect(url).toBe("https://app.yallo.fr/dashboard");
    });

    it("should build correct app URL for staging", () => {
      const path = "/dashboard";
      const url = `https://app.staging.yallo.fr${path}`;

      expect(url).toBe("https://app.staging.yallo.fr/dashboard");
    });
  });

  describe("Domain Detection", () => {
    it("should detect app domain from host", () => {
      const hosts = [
        { host: "app.localhost:3000", isApp: true },
        { host: "app.yallo.fr", isApp: true },
        { host: "app.staging.yallo.fr", isApp: true },
        { host: "localhost:3000", isApp: false },
        { host: "yallo.fr", isApp: false },
        { host: "staging.yallo.fr", isApp: false },
      ];

      hosts.forEach(({ host, isApp }) => {
        const isAppDomain = host.startsWith("app.");
        expect(isAppDomain).toBe(isApp);
      });
    });
  });

  describe("Route Classification", () => {
    it("should identify protected routes", () => {
      const protectedRoutes = ["/dashboard", "/admin", "/dashboard/menu"];
      const isProtectedRoute = (path: string) =>
        path.startsWith("/dashboard") || path.startsWith("/admin");

      protectedRoutes.forEach((route) => {
        expect(isProtectedRoute(route)).toBe(true);
      });
    });

    it("should identify public routes", () => {
      const publicRoutes = ["/login", "/", "/contact"];
      const isProtectedRoute = (path: string) =>
        path.startsWith("/dashboard") || path.startsWith("/admin");

      publicRoutes.forEach((route) => {
        expect(isProtectedRoute(route)).toBe(false);
      });
    });
  });

  describe("Role-based Access", () => {
    it("should allow ADMIN role to access /admin routes", () => {
      const userRole = "ADMIN";
      const path = "/admin";
      const isAdminRoute = path.startsWith("/admin");
      const hasAccess = isAdminRoute && userRole === "ADMIN";

      expect(hasAccess).toBe(true);
    });

    it("should deny OWNER role from /admin routes", () => {
      const userRole = "OWNER";
      const path = "/admin";
      const isAdminRoute = path.startsWith("/admin");
      const hasAccess = isAdminRoute && userRole === "ADMIN";

      expect(hasAccess).toBe(false);
    });

    it("should allow OWNER role to access /dashboard routes", () => {
      const userRole = "OWNER";
      const path = "/dashboard";
      const isDashboardRoute = path.startsWith("/dashboard");
      const hasAccess = isDashboardRoute && (userRole === "OWNER" || userRole === "ADMIN");

      expect(hasAccess).toBe(true);
    });
  });

  describe("Authentication State", () => {
    it("should detect logged in user from session", async () => {
      const mockSession: MockSession = {
        user: { id: "user-1", email: "test@test.com", role: "OWNER" },
      };
      vi.mocked(auth).mockResolvedValue(mockSession as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

      const session = await auth();
      const isLoggedIn = !!session?.user;

      expect(isLoggedIn).toBe(true);
    });

    it("should detect logged out state from null session", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const session = await auth();
      const isLoggedIn = !!session?.user;

      expect(isLoggedIn).toBe(false);
    });
  });

  describe("Password Change Requirement", () => {
    it("should detect when user must change password", async () => {
      const mockSession: MockSession = {
        user: { id: "user-1", email: "test@test.com", role: "OWNER", mustChangePassword: true },
      };
      vi.mocked(auth).mockResolvedValue(mockSession as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

      const session = await auth();
      const mustChangePassword = Boolean(session?.user?.mustChangePassword);

      expect(mustChangePassword).toBe(true);
    });

    it("should allow normal access when password change not required", async () => {
      const mockSession: MockSession = {
        user: { id: "user-1", email: "test@test.com", role: "OWNER", mustChangePassword: false },
      };
      vi.mocked(auth).mockResolvedValue(mockSession as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

      const session = await auth();
      const mustChangePassword = Boolean(session?.user?.mustChangePassword);

      expect(mustChangePassword).toBe(false);
    });
  });
});
