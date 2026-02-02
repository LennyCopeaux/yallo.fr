import { db } from "@/db";
import { restaurants, users, orders } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { DashboardTabs } from "@/components/admin";
import { Suspense } from "react";

async function getOwners() {
  return await db
    .select({
      id: users.id,
      email: users.email,
    })
    .from(users)
    .where(eq(users.role, "OWNER"))
    .orderBy(users.email);
}

async function getRestaurants(searchParams: { 
  status?: string; 
  search?: string;
  hasAI?: string;
}) {
  const conditions = [];

  if (searchParams.status && ["active", "suspended", "onboarding"].includes(searchParams.status)) {
    conditions.push(eq(restaurants.status, searchParams.status as "active" | "suspended" | "onboarding"));
  }

  if (searchParams.hasAI === "true") {
    conditions.push(sql`${restaurants.vapiAssistantId} IS NOT NULL`);
  }

  if (searchParams.search) {
    const searchPattern = `%${searchParams.search}%`;
    conditions.push(
      sql`(${restaurants.name} ILIKE ${searchPattern} OR ${users.email} ILIKE ${searchPattern})`
    );
  }

  const result = await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      slug: restaurants.slug,
      address: restaurants.address,
      phoneNumber: restaurants.phoneNumber,
      ownerId: restaurants.ownerId,
      status: restaurants.status,
      isActive: restaurants.isActive,
      vapiAssistantId: restaurants.vapiAssistantId,
      twilioPhoneNumber: restaurants.twilioPhoneNumber,
      createdAt: restaurants.createdAt,
      ownerEmail: users.email,
      ordersCount: sql<number>`COALESCE(COUNT(${orders.id}), 0)`.as('orders_count'),
    })
    .from(restaurants)
    .innerJoin(users, eq(restaurants.ownerId, users.id))
    .leftJoin(orders, eq(orders.restaurantId, restaurants.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(
      restaurants.id,
      restaurants.name,
      restaurants.slug,
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

  return result.map(r => ({
    ...r,
    ordersCount: Number(r.ordersCount),
  }));
}

async function getUsers() {
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
  const [totalOrders, owners, restaurantsList, usersList] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(orders).then(r => Number(r[0]?.count ?? 0)),
    getOwners(),
    getRestaurants(params),
    getUsers(),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">
          Gérez vos restaurants et utilisateurs
        </p>
      </div>

      <Suspense fallback={<div className="h-96" />}>
        <DashboardTabs
          restaurants={restaurantsList}
          users={usersList}
          owners={owners}
          totalOrders={totalOrders}
          defaultTab={params.tab || "restaurants"}
        />
      </Suspense>
    </div>
  );
}
