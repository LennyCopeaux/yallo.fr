import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, organizations, organizationMembers, restaurants, restaurantMembers, type UserRole, type SelectRestaurant } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export const RESTAURANT_COOKIE = "yallo_restaurant_id";

export type AppUser = typeof users.$inferSelect;

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getAppUser(): Promise<AppUser | null> {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const [appUser] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authUser.id))
    .limit(1);

  return appUser ?? null;
}

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

/**
 * Retourne toutes les organisations dont l'utilisateur est membre.
 */
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

/**
 * Retourne la première organisation de l'utilisateur (compat).
 * @deprecated Utiliser getUserOrganizations() pour le multi-orgs.
 */
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

/**
 * Retourne les IDs de restaurants accessibles pour l'utilisateur connecté.
 * OWNER/ADMIN : tous les restaurants de leurs organisations.
 * EMPLOYEE : uniquement les restaurants explicitement assignés via restaurant_members.
 */
async function getAccessibleRestaurantIds(userId: string, role: string): Promise<string[]> {
  if (role === "EMPLOYEE") {
    const memberships = await db
      .select({ restaurantId: restaurantMembers.restaurantId })
      .from(restaurantMembers)
      .where(eq(restaurantMembers.userId, userId));
    return memberships.map((m) => m.restaurantId);
  }

  // OWNER / ADMIN : accès via l'appartenance à l'organisation
  const orgRestaurants = await db
    .select({ id: restaurants.id })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .innerJoin(restaurants, eq(restaurants.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, userId));
  return orgRestaurants.map((r) => r.id);
}

/**
 * Retourne le restaurant sélectionné accessible à l'utilisateur connecté.
 * Priorité : cookie yallo_restaurant_id (si accessible), sinon premier accessible.
 * OWNER/ADMIN : accès via organisation. EMPLOYEE : accès via restaurant_members.
 */
export async function getAccessibleRestaurant(): Promise<SelectRestaurant | null> {
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
}

/**
 * Retourne le restaurant accessible pour un userId donné (évite le double getAppUser).
 */
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

/**
 * Retourne les restaurants accessibles à l'utilisateur.
 * OWNER/ADMIN : tous les restaurants de leurs organisations.
 * EMPLOYEE : uniquement les restaurants explicitement assignés.
 * Filtre optionnel par organisation.
 */
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

/**
 * Retourne le premier restaurant de l'organisation de l'utilisateur connecté.
 * Pour la compatibilité avec les pages single-restaurant.
 */
export async function getOwnerRestaurantFromOrg() {
  const org = await getUserOrganization();
  if (!org) return null;
  return org.restaurants[0] ?? null;
}
