"use server";

import { db } from "@/db";
import { orderItems, orders, type OrderStatus } from "@/db/schema";
import { requireAuth, getAccessibleRestaurant } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";
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
