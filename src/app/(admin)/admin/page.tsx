import { DashboardTabs } from "@/components/admin";
import { Suspense } from "react";
import { getOwners, getRestaurantsWithFilters, getUsers, getTotalOrdersCount } from "./queries";

export default async function AdminDashboardPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ 
    tab?: string;
    status?: string; 
    search?: string;
    hasAI?: string;
  }>;
}>) {
  const params = await searchParams;
  const [totalOrders, owners, restaurantsList, usersList] = await Promise.all([
    getTotalOrdersCount(),
    getOwners(),
    getRestaurantsWithFilters(params),
    getUsers(),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">
          Gérez vos restaurants et utilisateurs
        </p>
      </div>

      <Suspense fallback={<div className="h-96" />}>
        <DashboardTabs
          restaurants={restaurantsList}
          users={usersList}
          owners={owners}
          totalOrders={totalOrders}
          defaultTab={params.tab || "restaurants"}
        />
      </Suspense>
    </div>
  );
}
