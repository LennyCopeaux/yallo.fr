"use server";

import { db } from "@/db";
import { orders, orderItems, restaurants, type OrderStatus } from "@/db/schema";
import { auth } from "@/auth";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Récupérer les commandes du restaurant de l'utilisateur connecté
export async function getOrders() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  // Trouver le restaurant de l'utilisateur
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, session.user.id),
  });

  if (!restaurant) {
    return [];
  }

  // Récupérer les commandes avec leurs items
  const ordersWithItems = await db.query.orders.findMany({
    where: eq(orders.restaurantId, restaurant.id),
    orderBy: [desc(orders.createdAt)],
    with: {
      items: true,
    },
  });

  return ordersWithItems;
}

// Mettre à jour le statut d'une commande
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  // Vérifier que la commande appartient au restaurant de l'utilisateur
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, session.user.id),
  });

  if (!restaurant) {
    throw new Error("Restaurant non trouvé");
  }

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.restaurantId, restaurant.id)),
  });

  if (!order) {
    throw new Error("Commande non trouvée");
  }

  await db
    .update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath("/dashboard");
  return { success: true };
}

// Simuler une commande pour les tests
export async function simulateOrder() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  // Trouver le restaurant de l'utilisateur
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, session.user.id),
  });

  if (!restaurant) {
    throw new Error("Restaurant non trouvé. Veuillez d'abord créer un restaurant.");
  }

  // Générer un numéro de commande unique
  const orderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;

  // Exemples de produits simulés
  const sampleProducts = [
    { name: "Kebab Viande", price: 850, options: "Sauce blanche, Harissa" },
    { name: "Tacos XL", price: 950, options: "Viande hachée, Fromage" },
    { name: "Naan Poulet", price: 750, options: "Sauce curry" },
    { name: "Frites", price: 300, options: null },
    { name: "Coca-Cola", price: 250, options: null },
    { name: "Burger Classic", price: 890, options: "Sans oignon" },
    { name: "Menu Kebab", price: 1150, options: "Avec Frites et Boisson" },
  ];

  // Sélectionner 1 à 4 produits aléatoirement
  const numItems = Math.floor(1 + Math.random() * 3);
  const selectedProducts = [];
  const usedIndexes = new Set<number>();

  for (let i = 0; i < numItems; i++) {
    let index;
    do {
      index = Math.floor(Math.random() * sampleProducts.length);
    } while (usedIndexes.has(index));
    usedIndexes.add(index);

    const product = sampleProducts[index];
    const quantity = Math.floor(1 + Math.random() * 2);
    selectedProducts.push({
      ...product,
      quantity,
      totalPrice: product.price * quantity,
    });
  }

  // Calculer le total
  const totalAmount = selectedProducts.reduce((sum, p) => sum + p.totalPrice, 0);

  // Noms de clients simulés
  const customerNames = ["Jean D.", "Marie L.", "Ahmed B.", "Sophie M.", "Lucas P.", null];
  const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];

  // Téléphones simulés
  const phones = ["06 12 ** ** 42", "07 ** ** 89 32", "06 ** 45 ** 78", null];
  const customerPhone = phones[Math.floor(Math.random() * phones.length)];

  // Créer la commande
  const [newOrder] = await db
    .insert(orders)
    .values({
      restaurantId: restaurant.id,
      orderNumber,
      customerName,
      customerPhone,
      status: "NEW",
      totalAmount,
      pickupTime: new Date(Date.now() + 15 * 60 * 1000), // Dans 15 minutes
    })
    .returning();

  // Créer les items de la commande
  await db.insert(orderItems).values(
    selectedProducts.map((product) => ({
      orderId: newOrder.id,
      productName: product.name,
      quantity: product.quantity,
      unitPrice: product.price,
      totalPrice: product.totalPrice,
      options: product.options,
    }))
  );

  revalidatePath("/dashboard");
  return { success: true, orderNumber };
}

