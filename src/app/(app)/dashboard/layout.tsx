import { ModeToggle } from "@/components/navigation";
import { ClientMenu } from "@/components/dashboard/client-menu";
import { getUserRestaurant } from "@/features/orders/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const restaurant = await getUserRestaurant();
  const hasHubRise = !!(restaurant?.hubriseLocationId && restaurant?.hubriseAccessToken);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <ClientMenu hasHubRise={hasHubRise} />

      <main>
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
