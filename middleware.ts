import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

/**
 * Middleware Multi-Domaine pour Yallo
 * 
 * Architecture :
 * - yallo.fr (Site Vitrine) : Sert (marketing), aucune auth
 * - app.yallo.fr (Application SaaS) : Sert (app), auth complète
 * 
 * NOTE: Le middleware fonctionne en production mais peut avoir des problèmes
 * en développement avec Turbopack. Testez avec `pnpm build && pnpm start`
 */

// ============================================
// HELPERS
// ============================================

/**
 * Construit l'URL absolue du sous-domaine App
 */
function buildAppUrl(pathname: string, currentHost: string): URL {
  const isDev = currentHost.includes("localhost");
  
  if (isDev) {
    // En dev : http://app.localhost:PORT
    const port = currentHost.split(":")[1] || "3000";
    return new URL(`http://app.localhost:${port}${pathname}`);
  }
  
  // En prod : https://app.yallo.fr
  return new URL(`https://app.yallo.fr${pathname}`);
}

// ============================================
// MIDDLEWARE PRINCIPAL
// ============================================

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  
  // Récupération du hostname
  const host = req.headers.get("host") || "";
  
  // Détection du domaine App
  const isAppDomain = host.startsWith("app.");
  
  // Debug : Log pour tracer l'exécution (seulement en dev)
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] Host: ${host} | Path: ${pathname} | isApp: ${isAppDomain}`);
  }

  // ============================================
  // BRANCHE 1 : SITE MARKETING (yallo.fr)
  // ============================================
  if (!isAppDomain) {
    // Routes réservées à l'application
    const appOnlyRoutes = ["/login", "/dashboard", "/admin", "/update-password"];
    const isAppOnlyRoute = appOnlyRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    if (isAppOnlyRoute) {
      // Redirection vers le sous-domaine App
      const appUrl = buildAppUrl(pathname, host);
      return NextResponse.redirect(appUrl, 307);
    }
    
    // Tout le reste : servir le contenu marketing
    return NextResponse.next();
  }

  // ============================================
  // BRANCHE 2 : APPLICATION SAAS (app.yallo.fr)
  // ============================================
  
  // Récupération des données d'authentification via auth()
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const user = session?.user;
  const userRole = user?.role;
  const mustChangePassword = Boolean(user?.mustChangePassword);
  
  // Définition des types de routes
  const isLoginPage = pathname === "/login";
  const isUpdatePasswordPage = pathname === "/update-password";
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute = isDashboardRoute || isAdminRoute;
  const isApiRoute = pathname.startsWith("/api");
  const isRootRoute = pathname === "/";
  
  // Routes autorisées sur le sous-domaine App
  const allowedRoutes = ["/login", "/update-password", "/dashboard", "/admin", "/api"];
  const isAllowedRoute = allowedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // ============================================
  // RÈGLE 1 : Racine "/" -> Redirection
  // ============================================
  if (isRootRoute) {
    if (isLoggedIn) {
      if (mustChangePassword) {
        return NextResponse.redirect(buildAppUrl("/update-password", host), 307);
      }
      if (userRole === "ADMIN") {
        return NextResponse.redirect(buildAppUrl("/admin", host), 307);
      }
      return NextResponse.redirect(buildAppUrl("/dashboard", host), 307);
    }
    return NextResponse.redirect(buildAppUrl("/login", host), 307);
  }
  
  // ============================================
  // RÈGLE 2 : Routes non autorisées -> 404
  // ============================================
  if (!isAllowedRoute && !isApiRoute) {
    return new NextResponse("Not Found", { status: 404 });
  }
  
  // ============================================
  // RÈGLE 3 : Changement de mot de passe obligatoire
  // ============================================
  if (isLoggedIn && mustChangePassword && !isUpdatePasswordPage) {
    return NextResponse.redirect(buildAppUrl("/update-password", host), 307);
  }
  
  // ============================================
  // RÈGLE 4 : Routes protégées sans connexion
  // ============================================
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(buildAppUrl("/login", host), 307);
  }
  
  // ============================================
  // RÈGLE 5 : Page login avec connexion
  // ============================================
  if (isLoginPage && isLoggedIn) {
    if (mustChangePassword) {
      return NextResponse.redirect(buildAppUrl("/update-password", host), 307);
    }
    if (userRole === "ADMIN") {
      return NextResponse.redirect(buildAppUrl("/admin", host), 307);
    }
    return NextResponse.redirect(buildAppUrl("/dashboard", host), 307);
  }
  
  // ============================================
  // RÈGLE 6 : Accès admin sans rôle ADMIN
  // ============================================
  if (isAdminRoute && isLoggedIn && userRole !== "ADMIN") {
    return NextResponse.redirect(buildAppUrl("/dashboard", host), 307);
  }
  
  // ============================================
  // RÈGLE 7 : Accès dashboard avec rôle ADMIN
  // ============================================
  if (isDashboardRoute && isLoggedIn && userRole === "ADMIN") {
    return NextResponse.redirect(buildAppUrl("/admin", host), 307);
  }
  
  // ============================================
  // RÈGLE 8 : Route update-password sans connexion
  // ============================================
  if (isUpdatePasswordPage && !isLoggedIn) {
    return NextResponse.redirect(buildAppUrl("/login", host), 307);
  }
  
  // ============================================
  // RÈGLE FINALE : Laisser passer
  // ============================================
  return NextResponse.next();
}

// ============================================
// CONFIGURATION DU MATCHER
// ============================================
export const config = {
  matcher: [
    /*
     * Match toutes les routes SAUF :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico
     * - Fichiers statiques (images, fonts)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)).*)",
  ],
};
