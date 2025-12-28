import { db } from "@/db";
import { restaurants, users, orders } from "@/db/schema";
import { eq, sql, ilike, and } from "drizzle-orm";
import { RestaurantsDataTable, AddRestaurantDialog } from "@/components/admin";
import { Suspense } from "react";
import { Loader2, UtensilsCrossed } from "lucide-react";

// Récupère les OWNERS pour le dropdown
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

// Récupère tous les restaurants avec leurs owners
async function getRestaurants(searchParams: { 
  status?: string; 
  search?: string;
  hasAI?: string;
}) {
  const conditions = [];

  // Filtre par status
  if (searchParams.status && ["active", "suspended", "onboarding"].includes(searchParams.status)) {
    conditions.push(eq(restaurants.status, searchParams.status as "active" | "suspended" | "onboarding"));
  }

  // Filtre par AI configurée
  if (searchParams.hasAI === "true") {
    conditions.push(sql`${restaurants.vapiAssistantId} IS NOT NULL`);
  }

  // Recherche par nom ou email
  if (searchParams.search) {
    conditions.push(
      sql`(${restaurants.name} ILIKE ${`%${searchParams.search}%`} OR ${users.email} ILIKE ${`%${searchParams.search}%`})`
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

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; hasAI?: string }>;
}) {
  const params = await searchParams;
  const [owners, restaurantsList] = await Promise.all([
    getOwners(),
    getRestaurants(params),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Gérez tous vos restaurants et leur configuration
          </p>
        </div>
        <AddRestaurantDialog owners={owners} />
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
          <p className="text-xl sm:text-2xl font-bold">{restaurantsList.length}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
        </div>
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
          <p className="text-xl sm:text-2xl font-bold text-emerald-400">
            {restaurantsList.filter(r => r.status === "active").length}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">Actifs</p>
        </div>
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
          <p className="text-xl sm:text-2xl font-bold text-amber-400">
            {restaurantsList.filter(r => r.status === "onboarding").length}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">Onboarding</p>
        </div>
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
          <p className="text-xl sm:text-2xl font-bold text-red-400">
            {restaurantsList.filter(r => r.status === "suspended").length}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">Suspendu</p>
        </div>
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
          <p className="text-xl sm:text-2xl font-bold text-cyan-400">
            {restaurantsList.filter(r => r.vapiAssistantId).length}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">IA Active</p>
        </div>
      </div>

      {/* DataTable */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }>
        {restaurantsList.length === 0 ? (
          <div className="border border-border rounded-xl bg-card/20 p-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UtensilsCrossed className="w-8 h-8 text-primary/50" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Aucun restaurant</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                {owners.length === 0
                  ? "Créez d'abord un utilisateur OWNER avant de pouvoir créer un restaurant."
                  : "Créez votre premier restaurant pour commencer."}
              </p>
            </div>
          </div>
        ) : (
          <RestaurantsDataTable 
            data={restaurantsList} 
            owners={owners}
          />
        )}
      </Suspense>
    </div>
  );
}

