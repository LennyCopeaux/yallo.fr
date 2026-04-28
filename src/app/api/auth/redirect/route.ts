import { getAppUser } from "@/lib/auth";
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

export async function GET() {
  const user = await getAppUser();
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (!user) {
    return NextResponse.redirect(buildAppUrl("/login", host), 307);
  }

  // Check if the user needs to change their temporary password
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const redirectUrl =
    authUser?.user_metadata?.must_change_password === true
      ? buildAppUrl("/update-password", host)
      : user.role === "ADMIN"
        ? buildAppUrl("/admin", host)
        : buildAppUrl("/dashboard", host);

  const response = NextResponse.redirect(redirectUrl, 307);
  response.cookies.set("userRole", user.role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  if (authUser?.user_metadata?.must_change_password === true) {
    return response;
  }

  return response;
}
