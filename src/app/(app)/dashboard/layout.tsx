import { Suspense } from "react";
import { ClientSidebar } from "@/components/dashboard/client-sidebar";
import { DashboardKitchenAlert } from "@/components/orders/dashboard-kitchen-alert";
import { getAppUser, getUserOrganization, getUserRestaurants } from "@/lib/auth";
import { getSelectedRestaurantId } from "@/features/restaurant/switch-actions";
import { getSubscriptionAccess } from "@/lib/subscription-access";

/**
 * Le menu latéral a besoin de l'organisation, des restaurants et de
 * l'abonnement. Il est isolé dans son propre composant asynchrone derrière un
 * Suspense : la page (et son loading.tsx) peut s'afficher sans attendre ces
 * requêtes, au lieu d'être bloquée par le layout.
 */
async function DashboardSidebar({ selectedId }: Readonly<{ selectedId: string | null }>) {
  const [user, org, accessibleRestaurants, subscriptionAccess] = await Promise.all([
    getAppUser(),
    getUserOrganization(),
    getUserRestaurants(),
    getSubscriptionAccess(),
  ]);

  const restaurantList = accessibleRestaurants.map((r) => ({ id: r.id, name: r.name }));
  const currentRestaurant =
    restaurantList.find((r) => r.id === selectedId) ?? restaurantList[0] ?? null;

  const currentRestaurantFull = accessibleRestaurants.find((r) => r.id === currentRestaurant?.id);
  const hasHubriseConfig = !!(
    currentRestaurantFull?.hubriseLocationId && currentRestaurantFull?.hubriseAccessToken
  );

  const orgIdForSidebar = user?.role === "EMPLOYEE" ? null : (org?.id ?? null);
  const orgNameForSidebar = user?.role === "EMPLOYEE" ? null : (org?.name ?? null);

  return (
    <ClientSidebar
      hasHubriseConfig={hasHubriseConfig}
      restaurants={restaurantList}
      currentRestaurantId={currentRestaurant?.id ?? null}
      orgId={orgIdForSidebar}
      orgName={orgNameForSidebar}
      userRole={user?.role ?? "OWNER"}
      subscriptionLocked={!subscriptionAccess.hasAccess}
    />
  );
}

function SidebarSkeleton() {
  return (
    <aside className="sticky top-0 h-screen w-56 shrink-0 border-r border-border bg-background">
      <div className="h-16 border-b border-border" />
      <div className="animate-pulse space-y-2 p-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-10 rounded-xl bg-muted" />
        ))}
      </div>
    </aside>
  );
}

/** L'alerte cuisine ne doit pas tourner pour un abonnement verrouillé. */
async function KitchenAlertGate() {
  const subscriptionAccess = await getSubscriptionAccess();
  return subscriptionAccess.hasAccess ? <DashboardKitchenAlert /> : null;
}

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const selectedId = await getSelectedRestaurantId();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Suspense fallback={<SidebarSkeleton />}>
        <DashboardSidebar selectedId={selectedId} />
      </Suspense>
      <main key={selectedId ?? "default-restaurant"} className="flex-1 overflow-y-auto">
        <Suspense fallback={null}>
          <KitchenAlertGate />
        </Suspense>
        {children}
      </main>
    </div>
  );
}
