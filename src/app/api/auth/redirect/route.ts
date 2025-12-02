import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

function buildAppUrl(pathname: string, host: string): URL {
  const isDev = host.includes("localhost");
  
  if (isDev) {
    const port = host.split(":")[1] || "3000";
    return new URL(`http://app.localhost:${port}${pathname}`);
  }
  
  return new URL(`https://app.yallo.fr${pathname}`);
}

export async function GET() {
  const session = await auth();
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (!session?.user) {
    return NextResponse.redirect(buildAppUrl("/login", host), 307);
  }

  if (session.user.mustChangePassword === true) {
    return NextResponse.redirect(buildAppUrl("/update-password", host), 307);
  }

  if (session.user.role === "ADMIN") {
    return NextResponse.redirect(buildAppUrl("/admin", host), 307);
  }

  return NextResponse.redirect(buildAppUrl("/dashboard", host), 307);
}

