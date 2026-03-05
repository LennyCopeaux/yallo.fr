"use server";

import { db } from "@/db";
import { orders, restaurants, type OrderStatus } from "@/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getUserRestaurant() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, session.user.id),
  });

  return restaurant || null;
}

export async function getOrders() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  const ownerRestaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, session.user.id),
  });

  if (!ownerRestaurant) return [];

  return db.query.orders.findMany({
    where: eq(orders.restaurantId, ownerRestaurant.id),
    orderBy: [desc(orders.createdAt)],
    with: { items: true },
  });
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  const ownerRestaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, session.user.id),
  });
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
