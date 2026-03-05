import { ClientSidebar } from "@/components/dashboard/client-sidebar";
import { getUserRestaurant } from "@/features/orders/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const restaurant = await getUserRestaurant();
  const hasHubRise = !!(restaurant?.hubriseLocationId && restaurant?.hubriseAccessToken);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ClientSidebar hasHubRise={hasHubRise} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
