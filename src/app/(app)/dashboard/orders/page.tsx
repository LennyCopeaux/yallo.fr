import { getOrdersSnapshot, getUserRestaurant } from "@/features/orders/actions";
import { requireDashboardAccess } from "@/lib/dashboard-guard";
import { OrdersPageContent } from "./_components/orders-page-content";

export default async function OrdersPage() {
  await requireDashboardAccess();

  const restaurant = await getUserRestaurant();
  const orders = restaurant ? await getOrdersSnapshot() : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Commandes</h1>
        <p className="text-muted-foreground">
          Gérez vos commandes en temps réel.
        </p>
      </div>
      <OrdersPageContent initialOrders={orders} />
    </div>
  );
}
