import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }

  // Si l'utilisateur doit changer son mot de passe, redirige vers /update-password
  if (session.user.mustChangePassword === true) {
    return NextResponse.redirect(new URL("/update-password", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }

  // Redirection basée sur le rôle
  if (session.user.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }

  // Par défaut, OWNER va vers dashboard
  return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}

