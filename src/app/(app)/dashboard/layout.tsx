import { ClientSidebar } from "@/components/dashboard/client-sidebar";
import { getAppUser, getUserOrganization, getUserRestaurants } from "@/lib/auth";
import { getSelectedRestaurantId } from "@/features/restaurant/switch-actions";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, org, accessibleRestaurants, selectedId] = await Promise.all([
    getAppUser(),
    getUserOrganization(),
    getUserRestaurants(),
    getSelectedRestaurantId(),
  ]);

  const restaurantList = accessibleRestaurants.map((r) => ({ id: r.id, name: r.name }));
  const currentRestaurant =
    restaurantList.find((r) => r.id === selectedId) ?? restaurantList[0] ?? null;

  const currentRestaurantFull = accessibleRestaurants.find((r) => r.id === currentRestaurant?.id);
  const hasHubriseConfig = !!(
    currentRestaurantFull?.hubriseLocationId && currentRestaurantFull?.hubriseAccessToken
  );

  // EMPLOYEE users don't see org-level navigation
  const orgIdForSidebar = user?.role === "EMPLOYEE" ? null : (org?.id ?? null);
  const orgNameForSidebar = user?.role === "EMPLOYEE" ? null : (org?.name ?? null);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ClientSidebar
        hasHubriseConfig={hasHubriseConfig}
        restaurants={restaurantList}
        currentRestaurantId={currentRestaurant?.id ?? null}
        orgId={orgIdForSidebar}
        orgName={orgNameForSidebar}
        userRole={user?.role ?? "OWNER"}
      />
      <main key={currentRestaurant?.id ?? "no-restaurant"} className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
