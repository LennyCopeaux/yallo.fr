import { db } from "@/db";
import { restaurants, users, orders, organizations, organizationMembers, restaurantMembers } from "@/db/schema";
import { eq, sql, and, inArray, type SQL } from "drizzle-orm";

export type RestaurantSearchParams = {
  status?: string;
  search?: string;
  hasAI?: string;
};

export type OrganizationSearchParams = {
  status?: string;
  search?: string;
};

export async function getOwners() {
  return await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(inArray(users.role, ["OWNER", "EMPLOYEE"]))
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

  const restaurantIds = result.map((r) => r.id);
  const allRestaurantMembers = restaurantIds.length
    ? await db
        .select({
          restaurantId: restaurantMembers.restaurantId,
          email: users.email,
        })
        .from(restaurantMembers)
        .innerJoin(users, eq(restaurantMembers.userId, users.id))
        .where(inArray(restaurantMembers.restaurantId, restaurantIds))
    : [];

  const ownersByRestaurant = allRestaurantMembers.reduce<Record<string, string[]>>((acc, member) => {
    if (!acc[member.restaurantId]) acc[member.restaurantId] = [];
    if (!acc[member.restaurantId].includes(member.email)) {
      acc[member.restaurantId].push(member.email);
    }
    return acc;
  }, {});

  return result.map((r) => ({
    ...r,
    ordersCount: Number(r.ordersCount),
    owners: ownersByRestaurant[r.id] && ownersByRestaurant[r.id].length > 0
      ? ownersByRestaurant[r.id]
      : [r.ownerEmail],
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
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(sql`${users.createdAt} DESC`);
}

export async function getTotalOrdersCount() {
  const result = await db.select({ count: sql<number>`count(*)` }).from(orders);
  return Number(result[0]?.count ?? 0);
}

export async function getOrganizationsWithRestaurants(searchParams: OrganizationSearchParams = {}) {
  const conditions: SQL[] = [];

  if (searchParams.status && ["active", "suspended", "onboarding"].includes(searchParams.status)) {
    conditions.push(sql`${organizations.status} = ${searchParams.status}`);
  }

  if (searchParams.search) {
    const sanitizedSearch = searchParams.search.replaceAll(/[%_]/g, "");
    const searchPattern = `%${sanitizedSearch}%`;
    conditions.push(sql`${organizations.name} ILIKE ${searchPattern}`);
  }
  // Base org data + restaurant count
  const orgs = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      ownerId: organizations.ownerId,
      ownerEmail: users.email,
      isActive: organizations.isActive,
      status: organizations.status,
      stripeSubscriptionStatus: organizations.stripeSubscriptionStatus,
      createdAt: organizations.createdAt,
      restaurantCount: sql<number>`COUNT(DISTINCT ${restaurants.id})`.as("restaurant_count"),
    })
    .from(organizations)
    .innerJoin(users, eq(organizations.ownerId, users.id))
    .leftJoin(restaurants, eq(restaurants.organizationId, organizations.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(
      organizations.id,
      organizations.name,
      organizations.ownerId,
      organizations.isActive,
      organizations.status,
      organizations.stripeSubscriptionStatus,
      organizations.createdAt,
      users.email
    )
    .orderBy(sql`${organizations.createdAt} DESC`);

  // Fetch members for each org
  const orgIds = orgs.map((o) => o.id);
  const allMembers = orgIds.length
    ? await db
        .select({
          organizationId: organizationMembers.organizationId,
          userId: users.id,
          email: users.email,
        })
        .from(organizationMembers)
        .innerJoin(users, eq(organizationMembers.userId, users.id))
        .where(inArray(organizationMembers.organizationId, orgIds))
    : [];

  const membersByOrg = allMembers.reduce<Record<string, { id: string; email: string }[]>>((acc, m) => {
    if (!acc[m.organizationId]) acc[m.organizationId] = [];
    acc[m.organizationId].push({ id: m.userId, email: m.email });
    return acc;
  }, {});

  return orgs.map((o) => ({
    ...o,
    restaurantCount: Number(o.restaurantCount),
    members: membersByOrg[o.id] ?? [],
  }));
}

export type OrganizationRow = Awaited<ReturnType<typeof getOrganizationsWithRestaurants>>[number];
