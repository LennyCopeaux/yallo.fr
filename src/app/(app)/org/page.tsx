import { redirect } from "next/navigation";
import { getAppUser, getUserOrganizations, getUserRestaurants } from "@/lib/auth";
import { OrgWelcome } from "@/components/org/org-welcome";

export default async function OrgPage() {
  const user = await getAppUser();
  if (!user) redirect("/login");

  if (user.role === "EMPLOYEE") redirect("/dashboard");

  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {

    const restaurantAccess = await getUserRestaurants();
    if (restaurantAccess.length > 0) redirect("/dashboard");

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Aucune organisation</h1>
          <p className="text-muted-foreground text-sm">
            Votre compte n&apos;est rattaché à aucune organisation. Contactez votre administrateur.
          </p>
        </div>
      </div>
    );
  }

  if (organizations.length === 1) {

    redirect(`/org/${organizations[0].id}`);
  }

  const restaurants = await getUserRestaurants();

  return (
    <OrgWelcome
      user={{ firstName: user.firstName, email: user.email }}
      organizations={organizations}
      restaurants={restaurants}
    />
  );
}
