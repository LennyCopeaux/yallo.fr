"use server";

import { db } from "@/db";
import { orders, orderItems, restaurants, type OrderStatus } from "@/db/schema";
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

export async function simulateOrder() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  const ownerRestaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, session.user.id),
  });
  if (!ownerRestaurant) {
    throw new Error("Restaurant non trouvé. Veuillez d'abord créer un restaurant.");
  }

  const generatedOrderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;

  const mockProducts = [
    { name: "Kebab Viande", price: 850, options: "Sauce blanche, Harissa" },
    { name: "Tacos XL", price: 950, options: "Viande hachée, Fromage" },
    { name: "Naan Poulet", price: 750, options: "Sauce curry" },
    { name: "Frites", price: 300, options: null },
    { name: "Coca-Cola", price: 250, options: null },
    { name: "Burger Classic", price: 890, options: "Sans oignon" },
    { name: "Menu Kebab", price: 1150, options: "Avec Frites et Boisson" },
  ];

  const itemCount = Math.floor(1 + Math.random() * 3);
  const pickedProducts = [];
  const usedIndexes = new Set<number>();

  for (let i = 0; i < itemCount; i++) {
    let productIndex;
    do {
      productIndex = Math.floor(Math.random() * mockProducts.length);
    } while (usedIndexes.has(productIndex));
    usedIndexes.add(productIndex);

    const product = mockProducts[productIndex];
    const quantity = Math.floor(1 + Math.random() * 2);
    pickedProducts.push({
      ...product,
      quantity,
      totalPrice: product.price * quantity,
    });
  }

  const orderTotal = pickedProducts.reduce((sum, p) => sum + p.totalPrice, 0);

  const mockCustomerNames = ["Jean D.", "Marie L.", "Ahmed B.", "Sophie M.", "Lucas P.", null];
  const mockPhones = ["06 12 ** ** 42", "07 ** ** 89 32", "06 ** 45 ** 78", null];

  const [createdOrder] = await db
    .insert(orders)
    .values({
      restaurantId: ownerRestaurant.id,
      orderNumber: generatedOrderNumber,
      customerName: mockCustomerNames[Math.floor(Math.random() * mockCustomerNames.length)],
      customerPhone: mockPhones[Math.floor(Math.random() * mockPhones.length)],
      status: "NEW",
      totalAmount: orderTotal,
      pickupTime: new Date(Date.now() + 15 * 60 * 1000),
    })
    .returning();

  await db.insert(orderItems).values(
    pickedProducts.map((product) => ({
      orderId: createdOrder.id,
      productName: product.name,
      quantity: product.quantity,
      unitPrice: product.price,
      totalPrice: product.totalPrice,
      options: product.options,
    }))
  );

  revalidatePath("/dashboard");
  return { success: true, orderNumber: generatedOrderNumber };
}
