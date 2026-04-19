import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

function buildAppUrl(pathname: string, currentHost: string): URL {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return new URL(`${process.env.NEXT_PUBLIC_APP_URL}${pathname}`);
  }

  const isDev = currentHost.includes("localhost");

  if (isDev) {
    const port = currentHost.split(":")[1] || "3000";
    return new URL(`http://app.localhost:${port}${pathname}`);
  }

  const isStaging = currentHost.includes("staging");
  if (isStaging) {
    return new URL(`https://app.staging.yallo.fr${pathname}`);
  }

  return new URL(`https://app.yallo.fr${pathname}`);
}

function isAppOnlyRoute(pathname: string): boolean {
  const appOnlyRoutes = ["/login", "/dashboard", "/admin", "/update-password"];
  return appOnlyRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAllowedRoute(pathname: string): boolean {
  const allowedRoutes = ["/login", "/update-password", "/dashboard", "/admin", "/api"];
  return allowedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const host = req.headers.get("host") || "";
  const isAppDomain = host.startsWith("app.");

  if (!isAppDomain) {
    if (isAppOnlyRoute(pathname)) {
      return NextResponse.redirect(buildAppUrl(pathname, host), 307);
    }
    return NextResponse.next();
  }

  const { supabaseResponse, user: authUser } = await createClient(req);

  const isLoggedIn = !!authUser;
  const userRole =
    (authUser?.app_metadata?.role as string | undefined) ||
    (authUser?.user_metadata?.role as string | undefined);

  const isLoginPage = pathname === "/login";
  const isUpdatePasswordPage = pathname === "/update-password";
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute = isDashboardRoute || isAdminRoute;
  const isApiRoute = pathname.startsWith("/api");
  const isRootRoute = pathname === "/";

  if (isRootRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(buildAppUrl("/login", host), 307);
    }
    if (userRole === "ADMIN") {
      return NextResponse.redirect(buildAppUrl("/admin", host), 307);
    }
    return NextResponse.redirect(buildAppUrl("/dashboard", host), 307);
  }

  if (!isAllowedRoute(pathname) && !isApiRoute) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(buildAppUrl("/login", host), 307);
  }

  if (isLoginPage && isLoggedIn) {
    if (userRole === "ADMIN") {
      return NextResponse.redirect(buildAppUrl("/admin", host), 307);
    }
    return NextResponse.redirect(buildAppUrl("/dashboard", host), 307);
  }

  if (isAdminRoute && isLoggedIn && userRole !== "ADMIN") {
    return NextResponse.redirect(buildAppUrl("/dashboard", host), 307);
  }

  if (isDashboardRoute && isLoggedIn && userRole === "ADMIN") {
    return NextResponse.redirect(buildAppUrl("/admin", host), 307);
  }

  if (isUpdatePasswordPage && !isLoggedIn) {
    return NextResponse.redirect(buildAppUrl("/login", host), 307);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)).*)",
  ],
};
