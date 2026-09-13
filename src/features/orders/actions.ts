"use server";

import { db } from "@/db";
import { callLogs, orderItems, orders, type OrderStatus } from "@/db/schema";
import { requireAuth, getAccessibleRestaurant } from "@/lib/auth";
import { requirePaidSubscription } from "@/lib/subscription-access";
import { applyAutoRush } from "@/lib/services/auto-rush";
import { eq, desc, and, avg, count, gte, lte, sql } from "drizzle-orm";
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

/**
 * Le dashboard n'affiche que les commandes en cours et, au plus, 6 commandes
 * terminees. Charger tout l'historique (avec tous les articles) a chaque rendu
 * et a chaque rafraichissement automatique serait inutilement couteux.
 */
const DASHBOARD_ORDERS_LIMIT = 100;

export async function getOrders() {
  const ownerRestaurant = await getAccessibleRestaurant();
  if (!ownerRestaurant) return [];

  return db.query.orders.findMany({
    where: eq(orders.restaurantId, ownerRestaurant.id),
    orderBy: [desc(orders.createdAt)],
    limit: DASHBOARD_ORDERS_LIMIT,
    with: { items: true },
  });
}

/**
 * Le fuseau de reference est Paris : les bornes "aujourd'hui" / "hier" et les
 * heures du graphe doivent correspondre a la journee du restaurateur, pas au
 * fuseau UTC du serveur. `created_at` est stocke en UTC sans fuseau, d'ou la
 * double conversion.
 */
const PARIS_ORDER_DAY = sql`(((${orders.createdAt}) AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Paris')::date`;
const PARIS_ORDER_HOUR = sql`extract(hour from (((${orders.createdAt}) AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Paris'))`;
const PARIS_TODAY = sql`((now() AT TIME ZONE 'Europe/Paris')::date)`;
const PARIS_YESTERDAY = sql`((now() AT TIME ZONE 'Europe/Paris')::date - 1)`;

export type DashboardMetrics = {
  todayRevenueCents: number;
  todayOrderCount: number;
  yesterdayRevenueCents: number;
  yesterdayOrderCount: number;
  totalOrderCount: number;
  newOrderCount: number;
  preparingOrderCount: number;
  hourlyToday: { hour: number; count: number }[];
};

const EMPTY_DASHBOARD_METRICS: DashboardMetrics = {
  todayRevenueCents: 0,
  todayOrderCount: 0,
  yesterdayRevenueCents: 0,
  yesterdayOrderCount: 0,
  totalOrderCount: 0,
  newOrderCount: 0,
  preparingOrderCount: 0,
  hourlyToday: Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 })),
};

/** postgres.js renvoie les count/sum en chaine (bigint / numeric). */
function toInt(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

/**
 * KPIs du dashboard calcules en base plutot que sur la liste des 100 dernieres
 * commandes : le total etait plafonne a 100 et le CA du jour devenait faux des
 * qu'un restaurant depassait cette limite.
 *
 * Les commandes annulees sont exclues du CA et des volumes.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const restaurant = await getAccessibleRestaurant();
  if (!restaurant) return EMPTY_DASHBOARD_METRICS;

  const notCancelled = sql`${orders.status} <> 'CANCELLED'`;

  const [totalsPromise, hourlyPromise] = [
    db
      .select({
        totalCount: sql<string>`count(*) filter (where ${notCancelled})`,
        todayCount: sql<string>`count(*) filter (where ${notCancelled} and ${PARIS_ORDER_DAY} = ${PARIS_TODAY})`,
        todayRevenue: sql<string>`coalesce(sum(${orders.totalAmount}) filter (where ${notCancelled} and ${PARIS_ORDER_DAY} = ${PARIS_TODAY}), 0)`,
        yesterdayCount: sql<string>`count(*) filter (where ${notCancelled} and ${PARIS_ORDER_DAY} = ${PARIS_YESTERDAY})`,
        yesterdayRevenue: sql<string>`coalesce(sum(${orders.totalAmount}) filter (where ${notCancelled} and ${PARIS_ORDER_DAY} = ${PARIS_YESTERDAY}), 0)`,
        newCount: sql<string>`count(*) filter (where ${orders.status} = 'NEW')`,
        preparingCount: sql<string>`count(*) filter (where ${orders.status} = 'PREPARING')`,
      })
      .from(orders)
      .where(eq(orders.restaurantId, restaurant.id)),
    db
      .select({
        hour: sql<string>`${PARIS_ORDER_HOUR}`,
        count: sql<string>`count(*)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurant.id),
          notCancelled,
          sql`${PARIS_ORDER_DAY} = ${PARIS_TODAY}`
        )
      )
      .groupBy(PARIS_ORDER_HOUR),
  ];

  const [totalsRows, hourlyRows] = await Promise.all([totalsPromise, hourlyPromise]);
  const totals = totalsRows[0];

  const hourlyToday = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
  for (const row of hourlyRows) {
    const hour = toInt(row.hour);
    if (hour >= 0 && hour < 24) {
      hourlyToday[hour].count = toInt(row.count);
    }
  }

  return {
    todayRevenueCents: toInt(totals?.todayRevenue),
    todayOrderCount: toInt(totals?.todayCount),
    yesterdayRevenueCents: toInt(totals?.yesterdayRevenue),
    yesterdayOrderCount: toInt(totals?.yesterdayCount),
    totalOrderCount: toInt(totals?.totalCount),
    newOrderCount: toInt(totals?.newCount),
    preparingOrderCount: toInt(totals?.preparingCount),
    hourlyToday,
  };
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  await requireAuth();
  await requirePaidSubscription();

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

  // La charge cuisine vient de changer : le mode RUSH automatique peut retomber.
  await applyAutoRush(ownerRestaurant);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  return { success: true };
}

export async function simulateSubmitOrder() {
  // Outil de test : il ne doit jamais pouvoir creer de fausse commande en prod.
  if (process.env.NODE_ENV === "production") {
    throw new Error("La simulation de commande est désactivée en production");
  }

  await requireAuth();
  await requirePaidSubscription();

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
  totalMinutes: number;
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

export async function getRestaurantCallStats(
  rangeFilter: DateRangeFilter = "all_time"
): Promise<RestaurantCallStats> {
  const restaurant = await getAccessibleRestaurant();
  if (!restaurant) {
    return { totalCallsAllTime: 0, avgDurationSeconds: null, totalMinutes: 0 };
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
      totalSeconds: sql<string>`coalesce(sum(${callLogs.durationSeconds}), 0)`,
    })
    .from(callLogs)
    .where(and(...conditions));

  const avgRaw = result?.avgSeconds ? Number(result.avgSeconds) : null;
  return {
    totalCallsAllTime: result?.totalCalls ?? 0,
    avgDurationSeconds: avgRaw !== null && avgRaw > 0 ? Math.round(avgRaw) : null,
    totalMinutes: Math.round(toInt(result?.totalSeconds) / 60),
  };
}
