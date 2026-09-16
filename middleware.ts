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
  return appOnlyRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAllowedRoute(pathname: string): boolean {
  const allowedRoutes = ["/login", "/update-password", "/dashboard", "/admin", "/api", "/org"];
  return allowedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Préchargement du routeur Next (survol d'un lien, `router.prefetch`).
 * Les pages protégées vérifient elles-mêmes la session au rendu : inutile de
 * payer un aller-retour Supabase Auth pour un préchargement.
 */
function isRouterPrefetch(req: NextRequest): boolean {
  return (
    req.headers.get("next-router-prefetch") === "1" ||
    req.headers.get("purpose") === "prefetch" ||
    req.headers.get("sec-purpose")?.includes("prefetch") === true
  );
}

/**
 * Une redirection construite avec NextResponse.redirect() perd les cookies de
 * session que Supabase vient de rafraîchir : le token expiré était alors
 * rafraîchi à nouveau à chaque requête suivante.
 */
function redirectKeepingSession(url: URL, sessionResponse: NextResponse): NextResponse {
  const response = NextResponse.redirect(url, 307);
  for (const cookie of sessionResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }
  return response;
}

function redirectForRole(userRole: string | undefined, host: string, sessionResponse: NextResponse): NextResponse {
  if (userRole === "ADMIN") return redirectKeepingSession(buildAppUrl("/admin", host), sessionResponse);
  if (userRole === "EMPLOYEE") return redirectKeepingSession(buildAppUrl("/dashboard", host), sessionResponse);
  return redirectKeepingSession(buildAppUrl("/org", host), sessionResponse);
}

export async function middleware(req: NextRequest) {
  try {
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

    const isApiRoute = pathname.startsWith("/api");
    const isRootRoute = pathname === "/";

    // Tout ce qui ne dépend pas de la session est tranché AVANT l'appel réseau
    // à Supabase Auth : webhooks et routes API (elles ont leur propre
    // authentification), 404, préchargements du routeur.
    if (isApiRoute) {
      return NextResponse.next();
    }

    if (!isRootRoute && !isAllowedRoute(pathname)) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (isRouterPrefetch(req)) {
      return NextResponse.next();
    }

    const { supabaseResponse, user: authUser } = await createClient(req);

    const isLoggedIn = !!authUser;
    const userRole = req.cookies.get("userRole")?.value;

    const isLoginPage = pathname === "/login";
    const isUpdatePasswordPage = pathname === "/update-password";
    const isDashboardRoute = pathname.startsWith("/dashboard");
    const isOrgRoute = pathname.startsWith("/org");
    const isAdminRoute = pathname.startsWith("/admin");
    const isProtectedRoute = isDashboardRoute || isAdminRoute || isOrgRoute;

    if (isRootRoute) {
      if (!isLoggedIn) {
        return redirectKeepingSession(buildAppUrl("/login", host), supabaseResponse);
      }
      return redirectForRole(userRole, host, supabaseResponse);
    }

    if (isProtectedRoute && !isLoggedIn) {
      return redirectKeepingSession(buildAppUrl("/login", host), supabaseResponse);
    }

    if (isLoginPage && isLoggedIn) {
      return redirectForRole(userRole, host, supabaseResponse);
    }

    if (isAdminRoute && isLoggedIn && userRole !== "ADMIN") {
      return redirectKeepingSession(buildAppUrl("/org", host), supabaseResponse);
    }

    if (isOrgRoute && isLoggedIn && userRole === "EMPLOYEE") {
      return redirectKeepingSession(buildAppUrl("/dashboard", host), supabaseResponse);
    }

    if ((isDashboardRoute || isOrgRoute) && isLoggedIn && userRole === "ADMIN") {
      return redirectKeepingSession(buildAppUrl("/admin", host), supabaseResponse);
    }

    if (isUpdatePasswordPage && !isLoggedIn) {
      return redirectKeepingSession(buildAppUrl("/login", host), supabaseResponse);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|txt|xml)).*)",
  ],
};
