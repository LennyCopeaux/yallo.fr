import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  
  // Vérifie si l'utilisateur est connecté
  const isLoggedIn = !!req.auth;
  
  // Récupère les données de l'utilisateur
  const user = req.auth?.user;
  const userRole = user?.role;
  const mustChangePassword = Boolean(user?.mustChangePassword);

  // Routes protégées
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isUpdatePasswordPage = nextUrl.pathname === "/update-password";
  const isProtectedRoute = isAdminRoute || isDashboardRoute;
  const isLoginPage = nextUrl.pathname === "/login";

  // CONDITION CRITIQUE : Si l'utilisateur est connecté ET doit changer son mot de passe
  // ET qu'il n'est PAS déjà sur la page /update-password (pour éviter une boucle infinie)
  if (isLoggedIn && mustChangePassword === true && !isUpdatePasswordPage) {
    // Redirige vers la page de changement de mot de passe
    return NextResponse.redirect(new URL("/update-password", nextUrl));
  }

  // Si l'utilisateur est connecté et essaie d'accéder à la page de login
  if (isLoginPage && isLoggedIn) {
    // Si l'utilisateur doit changer son mot de passe, redirige vers /update-password
    if (mustChangePassword === true) {
      return NextResponse.redirect(new URL("/update-password", nextUrl));
    }
    // Sinon, redirige vers la bonne page selon le rôle
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Bloque l'accès à /dashboard et /admin si l'utilisateur doit changer son mot de passe
  if (isProtectedRoute && isLoggedIn && mustChangePassword === true) {
    return NextResponse.redirect(new URL("/update-password", nextUrl));
  }

  // Si un OWNER essaie d'accéder à /admin
  if (isAdminRoute && isLoggedIn && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Si un ADMIN essaie d'accéder à /dashboard
  if (isDashboardRoute && isLoggedIn && userRole === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

