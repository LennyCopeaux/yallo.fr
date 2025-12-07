import { db } from "@/db";
import { restaurants, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantDetailTabs } from "./_components/restaurant-detail-tabs";

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

// Récupère le restaurant complet
async function getRestaurant(id: string) {
  const [restaurant] = await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      slug: restaurants.slug,
      address: restaurants.address,
      phoneNumber: restaurants.phoneNumber,
      ownerId: restaurants.ownerId,
      status: restaurants.status,
      isActive: restaurants.isActive,
      plan: restaurants.plan,
      commissionRate: restaurants.commissionRate,
      stripeCustomerId: restaurants.stripeCustomerId,
      vapiAssistantId: restaurants.vapiAssistantId,
      systemPrompt: restaurants.systemPrompt,
      menuContext: restaurants.menuContext,
      twilioPhoneNumber: restaurants.twilioPhoneNumber,
      forwardingPhoneNumber: restaurants.forwardingPhoneNumber,
      businessHours: restaurants.businessHours,
      createdAt: restaurants.createdAt,
      updatedAt: restaurants.updatedAt,
      ownerEmail: users.email,
    })
    .from(restaurants)
    .innerJoin(users, eq(restaurants.ownerId, users.id))
    .where(eq(restaurants.id, id))
    .limit(1);

  return restaurant || null;
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [restaurant, owners] = await Promise.all([
    getRestaurant(id),
    getOwners(),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="mt-1 shrink-0"
          >
            <Link href="/admin/restaurants">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold">{restaurant.name}</h1>
              <span className={`text-xs px-2 py-1 rounded-full ${
                restaurant.status === 'active' 
                  ? 'bg-emerald-400/10 text-emerald-400'
                  : restaurant.status === 'onboarding'
                  ? 'bg-amber-400/10 text-amber-400'
                  : 'bg-red-400/10 text-red-400'
              }`}>
                {restaurant.status}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <span className="text-sm">/{restaurant.slug}</span>
              <span>•</span>
              <span className="text-sm">{restaurant.ownerEmail}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Status indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            restaurant.vapiAssistantId 
              ? 'bg-emerald-400/10 border border-emerald-400/20' 
              : 'bg-zinc-800/50 border border-border'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              restaurant.vapiAssistantId 
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' 
                : 'bg-zinc-600'
            }`} />
            <span className={`text-xs font-medium ${
              restaurant.vapiAssistantId ? 'text-emerald-400' : 'text-muted-foreground'
            }`}>
              {restaurant.vapiAssistantId ? 'IA Active' : 'IA Non configurée'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <RestaurantDetailTabs restaurant={restaurant} owners={owners} />
    </div>
  );
}

