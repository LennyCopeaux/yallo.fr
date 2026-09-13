import { getOrders, getUserRestaurant } from "@/features/orders/actions";
import { requireDashboardAccess } from "@/lib/dashboard-guard";
import { OrdersPageContent } from "./_components/orders-page-content";

export default async function OrdersPage() {
  await requireDashboardAccess();

  const restaurant = await getUserRestaurant();
  const ordersData = restaurant ? await getOrders() : [];

  const orders = ordersData.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    status: order.status,
    totalAmount: order.totalAmount,
    pickupTime: order.pickupTime,
    notes: order.notes,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      options: item.options,
    })),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Commandes</h1>
        <p className="text-muted-foreground">
          Gérez vos commandes en temps réel.
        </p>
      </div>
      <OrdersPageContent orders={orders} />
    </div>
  );
}
