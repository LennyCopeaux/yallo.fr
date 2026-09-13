import { redirect } from "next/navigation";
import { getAppUser, type AppUser } from "@/lib/auth";
import { getSubscriptionAccess } from "@/lib/subscription-access";

/**
 * Garde commune aux pages du dashboard restaurant :
 * - non connecté → /login
 * - ADMIN → /admin
 * - abonnement inactif → /dashboard/billing (seule page accessible sans payer)
 */
export async function requireDashboardAccess(): Promise<AppUser> {
  const user = await getAppUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const access = await getSubscriptionAccess();
  if (!access.hasAccess) {
    redirect("/dashboard/billing?locked=1");
  }

  return user;
}
