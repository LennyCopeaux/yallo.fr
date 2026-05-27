import { db } from "@/db";
import { organizations, users, restaurants, organizationMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrgDetailTabs } from "@/components/admin/org-detail-tabs";
import { getOwners } from "@/app/(admin)/admin/queries";

async function getOrganization(id: string) {
  const [org] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      ownerId: organizations.ownerId,
      ownerEmail: users.email,
      isActive: organizations.isActive,
      status: organizations.status,
      stripeCustomerId: organizations.stripeCustomerId,
      stripeSubscriptionId: organizations.stripeSubscriptionId,
      stripeSubscriptionStatus: organizations.stripeSubscriptionStatus,
      stripePriceId: organizations.stripePriceId,
      stripeCurrentPeriodEnd: organizations.stripeCurrentPeriodEnd,
      billingStartDate: organizations.billingStartDate,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
    })
    .from(organizations)
    .innerJoin(users, eq(organizations.ownerId, users.id))
    .where(eq(organizations.id, id))
    .limit(1);

  return org || null;
}

export default async function OrgDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  const [org, owners, members, assignedRestaurants, allRestaurants] = await Promise.all([
    getOrganization(id),
    getOwners(),
    db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, id)),
    db
      .select({ id: restaurants.id, name: restaurants.name, status: restaurants.status })
      .from(restaurants)
      .where(eq(restaurants.organizationId, id))
      .orderBy(restaurants.name),
    db
      .select({ id: restaurants.id, name: restaurants.name, status: restaurants.status })
      .from(restaurants)
      .orderBy(restaurants.name),
  ]);

  if (!org) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="mt-1 shrink-0 h-10 w-10 sm:h-9 sm:w-9"
        >
          <Link href="/admin">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{org.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{org.ownerEmail}</p>
          </div>
        </div>
      </div>

      <OrgDetailTabs
        org={org}
        owners={owners}
        members={members}
        assignedRestaurants={assignedRestaurants}
        allRestaurants={allRestaurants}
      />
    </div>
  );
}
