import { db } from "@/db";
import { restaurants, users, orders } from "@/db/schema";
import { eq, sql, and, type SQL } from "drizzle-orm";

export type RestaurantSearchParams = {
  status?: string;
  search?: string;
  hasAI?: string;
};

export async function getOwners() {
  return await db
    .select({
      id: users.id,
      email: users.email,
    })
    .from(users)
    .where(eq(users.role, "OWNER"))
    .orderBy(users.email);
}

export async function getRestaurantsWithFilters(searchParams: RestaurantSearchParams) {
  const conditions: SQL[] = [];

  if (searchParams.status && ["active", "suspended", "onboarding"].includes(searchParams.status)) {
    conditions.push(eq(restaurants.status, searchParams.status as "active" | "suspended" | "onboarding"));
  }

  if (searchParams.hasAI === "true") {
    conditions.push(sql`${restaurants.vapiAssistantId} IS NOT NULL`);
  }

  if (searchParams.search) {
    const sanitizedSearch = searchParams.search.replaceAll(/[%_]/g, "");
    const searchPattern = `%${sanitizedSearch}%`;
    conditions.push(
      sql`(${restaurants.name} ILIKE ${searchPattern} OR ${users.email} ILIKE ${searchPattern})`
    );
  }

  const result = await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      address: restaurants.address,
      phoneNumber: restaurants.phoneNumber,
      ownerId: restaurants.ownerId,
      status: restaurants.status,
      isActive: restaurants.isActive,
      vapiAssistantId: restaurants.vapiAssistantId,
      twilioPhoneNumber: restaurants.twilioPhoneNumber,
      createdAt: restaurants.createdAt,
      ownerEmail: users.email,
      ordersCount: sql<number>`COALESCE(COUNT(${orders.id}), 0)`.as("orders_count"),
    })
    .from(restaurants)
    .innerJoin(users, eq(restaurants.ownerId, users.id))
    .leftJoin(orders, eq(orders.restaurantId, restaurants.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(
      restaurants.id,
      restaurants.name,
      restaurants.address,
      restaurants.phoneNumber,
      restaurants.ownerId,
      restaurants.status,
      restaurants.isActive,
      restaurants.vapiAssistantId,
      restaurants.twilioPhoneNumber,
      restaurants.createdAt,
      users.email
    )
    .orderBy(sql`${restaurants.createdAt} DESC`);

  return result.map((r) => ({
    ...r,
    ordersCount: Number(r.ordersCount),
  }));
}

export async function getUsers() {
  return await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      mustChangePassword: users.mustChangePassword,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(sql`${users.createdAt} DESC`);
}

export async function getTotalOrdersCount() {
  const result = await db.select({ count: sql<number>`count(*)` }).from(orders);
  return Number(result[0]?.count ?? 0);
}
