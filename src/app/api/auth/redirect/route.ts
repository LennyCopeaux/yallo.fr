import { getAppUser, getAuthUser, getUserOrganizations, type AppUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

function buildAppUrl(pathname: string, host: string): URL {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return new URL(`${process.env.NEXT_PUBLIC_APP_URL}${pathname}`);
  }

  const isDev = host.includes("localhost");

  if (isDev) {
    const port = host.split(":")[1] || "3000";
    return new URL(`http://app.localhost:${port}${pathname}`);
  }

  const isStaging = host.includes("staging");
  if (isStaging) {
    return new URL(`https://app.staging.yallo.fr${pathname}`);
  }

  return new URL(`https://app.yallo.fr${pathname}`);
}

/**
 * Destination finale calculée ici, en une seule redirection.
 * Avant : /org se rendait entièrement puis redirigeait vers /org/{id} pour
 * l'immense majorité des comptes (une seule organisation), et ce handler
 * refaisait un appel Supabase Auth qu'il avait déjà en cache.
 */
async function resolveDestination(user: AppUser): Promise<string> {
  if (user.role === "ADMIN") return "/admin";
  if (user.role === "EMPLOYEE") return "/dashboard";

  const organizations = await getUserOrganizations();
  if (organizations.length === 1) return `/org/${organizations[0].id}`;
  return "/org";
}

export async function GET() {
  try {
    const [user, authUser, headersList] = await Promise.all([getAppUser(), getAuthUser(), headers()]);
    const host = headersList.get("host") || "";

    if (!user) {
      return NextResponse.redirect(buildAppUrl("/login", host), 307);
    }

    const mustChangePassword = authUser?.user_metadata?.must_change_password === true;
    const destination = mustChangePassword ? "/update-password" : await resolveDestination(user);

    const response = NextResponse.redirect(buildAppUrl(destination, host), 307);
    response.cookies.set("userRole", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[/api/auth/redirect] Error:", error);
    return NextResponse.json(
      {
        error: "Authentication redirect failed",
        details: process.env.VERCEL_ENV !== "production" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
