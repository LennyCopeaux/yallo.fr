import { db } from "@/db";
import { restaurants, users, organizations, restaurantMembers, type RestaurantStatus } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantDetailTabs } from "@/components/admin";
import { AdminStatusBadge } from "@/components/admin/status-badge";

function getStatusBadge(status: RestaurantStatus) {
  switch (status) {
    case "active":
      return <AdminStatusBadge tone="active" label="Actif" />;
    case "onboarding":
      return <AdminStatusBadge tone="warning" label="Onboarding" />;
    default:
      return <AdminStatusBadge tone="danger" label="Suspendu" />;
  }
}

async function getOwners() {
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

async function getRestaurant(id: string) {
  const [restaurant] = await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      address: restaurants.address,
      phoneNumber: restaurants.phoneNumber,
      ownerId: restaurants.ownerId,
      status: restaurants.status,
      isActive: restaurants.isActive,
      vapiAssistantId: restaurants.vapiAssistantId,
      vapiPhoneNumberId: restaurants.vapiPhoneNumberId,

      systemPrompt: restaurants.systemPrompt,
      menuContext: restaurants.menuContext,
      twilioPhoneNumber: restaurants.twilioPhoneNumber,
      businessHours: restaurants.businessHours,
      hubriseLocationId: restaurants.hubriseLocationId,
      hubriseAccessToken: restaurants.hubriseAccessToken,
      createdAt: restaurants.createdAt,
      updatedAt: restaurants.updatedAt,
      ownerEmail: users.email,
      organizationId: restaurants.organizationId,
    })
    .from(restaurants)
    .innerJoin(users, eq(restaurants.ownerId, users.id))
    .where(eq(restaurants.id, id))
    .limit(1);

  return restaurant || null;
}

export default async function RestaurantDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const [restaurant, owners, organizationsList, restaurantMembersList] = await Promise.all([
    getRestaurant(id),
    getOwners(),
    db.select({ id: organizations.id, name: organizations.name }).from(organizations).orderBy(organizations.name),
    db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(restaurantMembers)
      .innerJoin(users, eq(restaurantMembers.userId, users.id))
      .where(eq(restaurantMembers.restaurantId, id)),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="mt-1 shrink-0 h-10 w-10 sm:h-9 sm:w-9"
          >
            <Link href="/admin?tab=restaurants">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{restaurant.name}</h1>
              {getStatusBadge(restaurant.status)}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-muted-foreground sm:justify-between">
              <span className="text-xs sm:text-sm break-all">{restaurant.ownerEmail}</span>
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <AdminStatusBadge
                  tone={restaurant.vapiAssistantId ? "active" : "neutral"}
                  label={restaurant.vapiAssistantId ? "IA active" : "IA non configurée"}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 sm:hidden">
          <AdminStatusBadge
            tone={restaurant.vapiAssistantId ? "active" : "neutral"}
            label={restaurant.vapiAssistantId ? "IA active" : "IA non configurée"}
          />
        </div>
      </div>

      <RestaurantDetailTabs restaurant={restaurant} owners={owners} organizations={organizationsList} restaurantMembers={restaurantMembersList} />
    </div>
  );
}

