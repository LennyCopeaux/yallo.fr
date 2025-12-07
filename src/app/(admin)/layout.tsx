import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Redirige si doit changer mot de passe
  if (session.user.mustChangePassword === true) {
    redirect("/update-password");
  }

  // Seuls les ADMIN peuvent accéder
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

