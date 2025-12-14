import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";

function buildAppUrl(pathname: string, currentHost: string): URL {
  const isDev = currentHost.includes("localhost");
  
  if (isDev) {
    const port = currentHost.split(":")[1] || "3000";
    return new URL(`http://app.localhost:${port}${pathname}`);
  }
  
  return new URL(`https://app.yallo.fr${pathname}`);
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const host = req.headers.get("host") || "";
  const isAppDomain = host.startsWith("app.");

  if (!isAppDomain) {
    const appOnlyRoutes = ["/login", "/dashboard", "/admin", "/update-password"];
    const isAppOnlyRoute = appOnlyRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    if (isAppOnlyRoute) {
      return NextResponse.redirect(buildAppUrl(pathname, host), 307);
    }
    
    return NextResponse.next();
  }

  const session = await auth();
  const isLoggedIn = !!session?.user;
  const user = session?.user;
  const userRole = user?.role;
  const mustChangePassword = Boolean(user?.mustChangePassword);
  
  const isLoginPage = pathname === "/login";
  const isUpdatePasswordPage = pathname === "/update-password";
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute = isDashboardRoute || isAdminRoute;
  const isApiRoute = pathname.startsWith("/api");
  const isRootRoute = pathname === "/";
  
  const allowedRoutes = ["/login", "/update-password", "/dashboard", "/admin", "/api"];
  const isAllowedRoute = allowedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

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

  if (!isAllowedRoute && !isApiRoute) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (isLoggedIn && mustChangePassword && !isUpdatePasswordPage) {
    return NextResponse.redirect(buildAppUrl("/update-password", host), 307);
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(buildAppUrl("/login", host), 307);
  }

  if (isLoginPage && isLoggedIn) {
    if (mustChangePassword) {
      return NextResponse.redirect(buildAppUrl("/update-password", host), 307);
    }
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)).*)",
  ],
};
