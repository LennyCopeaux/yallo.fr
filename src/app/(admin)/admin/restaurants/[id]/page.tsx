import { db } from "@/db";
import { restaurants, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantDetailTabs } from "@/components/admin";

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
      stripeCustomerId: restaurants.stripeCustomerId,
      billingStartDate: restaurants.billingStartDate,
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
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
              {restaurant.status === 'active' ? (
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 shrink-0">
                  Actif
                </span>
              ) : restaurant.status === 'onboarding' ? (
                <span className="text-xs px-2 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
                  Onboarding
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-red-400/10 text-red-400 border border-red-400/20 shrink-0">
                  Suspendu
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-muted-foreground">
              <span className="text-xs sm:text-sm">/{restaurant.slug}</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs sm:text-sm break-all">{restaurant.ownerEmail}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Status indicator */}
          <div className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg ${
            restaurant.vapiAssistantId 
              ? 'bg-emerald-400/10 border border-emerald-400/20' 
              : 'bg-zinc-800/50 border border-border'
          }`}>
            <div className={`w-2 h-2 rounded-full shrink-0 ${
              restaurant.vapiAssistantId 
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' 
                : 'bg-zinc-600'
            }`} />
            <span className={`text-xs font-medium whitespace-nowrap ${
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

