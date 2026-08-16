import { DashboardTabs } from "@/components/admin";
import { Suspense } from "react";
import { getOwners, getRestaurantsWithFilters, getUsers, getTotalOrdersCount, getOrganizationsWithRestaurants } from "./queries";

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
  const [totalOrders, owners, restaurantsList, usersList, organizationsList] = await Promise.all([
    getTotalOrdersCount(),
    getOwners(),
    getRestaurantsWithFilters(params),
    getUsers(),
    getOrganizationsWithRestaurants(),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">
          Gérez vos organisations, restaurants et utilisateurs
        </p>
      </div>

      <Suspense fallback={<div className="h-96" />}>
        <DashboardTabs
          restaurants={restaurantsList}
          users={usersList}
          owners={owners}
          totalOrders={totalOrders}
          organizations={organizationsList}
          defaultTab={params.tab || "organizations"}
        />
      </Suspense>
    </div>
  );
}
