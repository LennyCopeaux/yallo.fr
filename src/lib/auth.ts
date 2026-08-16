import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, organizations, organizationMembers, restaurants, restaurantMembers, type UserRole, type SelectRestaurant } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export const RESTAURANT_COOKIE = "yallo_restaurant_id";

export type AppUser = typeof users.$inferSelect;

/**
 * Memoized per-request: un seul appel HTTP à Supabase Auth par render,
 * même si getAuthUser() est appelée depuis plusieurs Server Components ou actions.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Memoized per-request: une seule requête DB par render pour récupérer
 * l'utilisateur applicatif, peu importe le nombre d'appelants.
 */
export const getAppUser = cache(async (): Promise<AppUser | null> => {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const [appUser] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authUser.id))
    .limit(1);

  return appUser ?? null;
});

export async function requireAuth(): Promise<AppUser> {
  const user = await getAppUser();
  if (!user) throw new Error("Non autorisé");
  return user;
}

export async function requireAdmin(): Promise<AppUser> {
  const user = await getAppUser();
  if (!user || user.role !== "ADMIN") throw new Error("Non autorisé");
  return user;
}

export async function requireRole(role: UserRole): Promise<AppUser> {
  const user = await getAppUser();
  if (!user || user.role !== role) throw new Error("Non autorisé");
  return user;
}

export async function getUserOrganizations() {
  const user = await getAppUser();
  if (!user?.id) return [];

  const memberships = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      ownerId: organizations.ownerId,
      isActive: organizations.isActive,
      stripeSubscriptionStatus: organizations.stripeSubscriptionStatus,
      stripeCurrentPeriodEnd: organizations.stripeCurrentPeriodEnd,
      createdAt: organizations.createdAt,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, user.id));

  return memberships;
}

export async function getUserOrganization() {
  const orgs = await getUserOrganizations();
  if (!orgs.length) return null;

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgs[0].id),
    with: {
      restaurants: true,
    },
  });

  return org ?? null;
}

async function getAccessibleRestaurantIds(userId: string, role: string): Promise<string[]> {
  if (role === "EMPLOYEE") {
    const memberships = await db
      .select({ restaurantId: restaurantMembers.restaurantId })
      .from(restaurantMembers)
      .where(eq(restaurantMembers.userId, userId));
    return memberships.map((m) => m.restaurantId);
  }

  const orgRestaurants = await db
    .select({ id: restaurants.id })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .innerJoin(restaurants, eq(restaurants.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, userId));
  return orgRestaurants.map((r) => r.id);
}

/**
 * Memoized per-request: évite de refaire les 2 requêtes DB d'accès restaurant
 * à chaque appel (getOrders, getRestaurantCallStats, etc. l'invoquent toutes).
 */
export const getAccessibleRestaurant = cache(async (): Promise<SelectRestaurant | null> => {
  const user = await getAppUser();
  if (!user?.id) return null;

  const cookieStore = await cookies();
  const selectedId = cookieStore.get(RESTAURANT_COOKIE)?.value;

  const accessibleIds = await getAccessibleRestaurantIds(user.id, user.role);
  if (!accessibleIds.length) return null;

  const targetId =
    selectedId && accessibleIds.includes(selectedId) ? selectedId : accessibleIds[0];

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, targetId))
    .limit(1);

  return restaurant ?? null;
});

export async function getAccessibleRestaurantForUser(
  userId: string,
  selectedId?: string
): Promise<SelectRestaurant | null> {
  const memberships = await db
    .select({ restaurantId: restaurantMembers.restaurantId })
    .from(restaurantMembers)
    .where(eq(restaurantMembers.userId, userId));

  const accessibleIds = memberships.map((m) => m.restaurantId);
  if (!accessibleIds.length) return null;

  const targetId =
    selectedId && accessibleIds.includes(selectedId) ? selectedId : accessibleIds[0];

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, targetId))
    .limit(1);

  return restaurant ?? null;
}

export async function getUserRestaurants(organizationId?: string) {
  const user = await getAppUser();
  if (!user?.id) return [];

  const accessibleIds = await getAccessibleRestaurantIds(user.id, user.role);
  if (!accessibleIds.length) return [];

  const rows = await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      phoneNumber: restaurants.phoneNumber,
      status: restaurants.status,
      organizationId: restaurants.organizationId,
      vapiAssistantId: restaurants.vapiAssistantId,
      hubriseLocationId: restaurants.hubriseLocationId,
      hubriseAccessToken: restaurants.hubriseAccessToken,
    })
    .from(restaurants)
    .where(inArray(restaurants.id, accessibleIds));

  if (organizationId) {
    return rows.filter((r) => r.organizationId === organizationId);
  }
  return rows;
}

export async function getOwnerRestaurantFromOrg() {
  const org = await getUserOrganization();
  if (!org) return null;
  return org.restaurants[0] ?? null;
}
