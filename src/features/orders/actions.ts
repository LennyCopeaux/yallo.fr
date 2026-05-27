"use server";

import { db } from "@/db";
import { callLogs, orderItems, orders, type OrderStatus } from "@/db/schema";
import { requireAuth, getAccessibleRestaurant } from "@/lib/auth";
import { eq, desc, and, avg, count, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `#${timestamp}${random}`;
}

export async function getUserRestaurant() {
  return getAccessibleRestaurant();
}

export async function getOrders() {
  const ownerRestaurant = await getAccessibleRestaurant();
  if (!ownerRestaurant) return [];

  return db.query.orders.findMany({
    where: eq(orders.restaurantId, ownerRestaurant.id),
    orderBy: [desc(orders.createdAt)],
    with: { items: true },
  });
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  await requireAuth();

  const ownerRestaurant = await getAccessibleRestaurant();
  if (!ownerRestaurant) throw new Error("Restaurant non trouvé");

  const targetOrder = await db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.restaurantId, ownerRestaurant.id)),
  });
  if (!targetOrder) throw new Error("Commande non trouvée");

  await db
    .update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath("/dashboard");
  return { success: true };
}

export async function simulateSubmitOrder() {
  await requireAuth();

  const ownerRestaurant = await getAccessibleRestaurant();

  if (!ownerRestaurant) {
    throw new Error("Restaurant non trouvé");
  }

  const basePrice = 890;
  const optionPrice = 90;
  const quantity = 1;
  const totalPrice = (basePrice + optionPrice) * quantity;

  const [createdOrder] = await db
    .insert(orders)
    .values({
      restaurantId: ownerRestaurant.id,
      orderNumber: generateOrderNumber(),
      customerName: "Test IA",
      customerPhone: null,
      status: "NEW",
      totalAmount: totalPrice,
      notes: "Commande de test via bouton simulate submit_order",
    })
    .returning();

  await db.insert(orderItems).values({
    orderId: createdOrder.id,
    productName: "Tacos Double (2 viandes)",
    quantity,
    unitPrice: basePrice + optionPrice,
    totalPrice,
    options: "Viandes: Escalope de Poulet, Boeuf Hache | Base: Frites | Sauce: Algerienne",
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return { success: true, orderId: createdOrder.id };
}

export type DateRangeFilter =
  | "last_7_days"
  | "last_30_days"
  | "current_month"
  | "previous_month"
  | "all_time";

export type RestaurantCallStats = {
  totalCallsAllTime: number;
  avgDurationSeconds: number | null;
};

function resolveDateRangeForRestaurant(filter: DateRangeFilter): { from: Date; to: Date | null } {
  const now = new Date();
  switch (filter) {
    case "last_7_days": {
      const from = new Date(now);
      from.setDate(now.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      return { from, to: null };
    }
    case "last_30_days": {
      const from = new Date(now);
      from.setDate(now.getDate() - 29);
      from.setHours(0, 0, 0, 0);
      return { from, to: null };
    }
    case "current_month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to: null };
    }
    case "previous_month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { from, to };
    }
    case "all_time":
    default:
      return { from: new Date(0), to: null };
  }
}

/**
 * Retourne les statistiques d'appels IA pour le restaurant courant.
 */
export async function getRestaurantCallStats(
  rangeFilter: DateRangeFilter = "all_time"
): Promise<RestaurantCallStats> {
  const restaurant = await getAccessibleRestaurant();
  if (!restaurant) {
    return { totalCallsAllTime: 0, avgDurationSeconds: null };
  }

  const { from, to } = resolveDateRangeForRestaurant(rangeFilter);

  const conditions = [
    eq(callLogs.restaurantId, restaurant.id),
    gte(callLogs.createdAt, from),
    ...(to ? [lte(callLogs.createdAt, to)] : []),
  ];

  const [result] = await db
    .select({
      totalCalls: count(callLogs.id),
      avgSeconds: avg(callLogs.durationSeconds),
    })
    .from(callLogs)
    .where(and(...conditions));

  const avgRaw = result?.avgSeconds ? Number(result.avgSeconds) : null;
  return {
    totalCallsAllTime: result?.totalCalls ?? 0,
    avgDurationSeconds: avgRaw !== null && avgRaw > 0 ? Math.round(avgRaw) : null,
  };
}
