import { redirect } from "next/navigation";
import { getAppUser, getUserOrganizations } from "@/lib/auth";
import { db } from "@/db";
import { organizations, restaurants, orders, callLogs } from "@/db/schema";
import { eq, count, sum, gte, inArray } from "drizzle-orm";
import { OrgDashboard } from "@/components/org/org-dashboard";
import { cookies } from "next/headers";
import { getCallUsageForCurrentPeriod } from "@/features/billing/usage-actions";
import { SUBSCRIPTION_PLANS } from "@/features/billing/plans";

async function getOrgStats(orgId: string) {
  const restaurantList = await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      status: restaurants.status,
      vapiAssistantId: restaurants.vapiAssistantId,
      phoneNumber: restaurants.phoneNumber,
    })
    .from(restaurants)
    .where(eq(restaurants.organizationId, orgId));

  const restaurantIds = restaurantList.map((r) => r.id);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const ordersStats =
    restaurantIds.length > 0
      ? await db
          .select({ count: count(), total: sum(orders.totalAmount) })
          .from(orders)
          .where(inArray(orders.restaurantId, restaurantIds))
      : [{ count: 0, total: null }];

  const callsStats =
    restaurantIds.length > 0
      ? await db
          .select({ count: count() })
          .from(callLogs)
          .where(inArray(callLogs.restaurantId, restaurantIds))
      : [{ count: 0 }];

  return {
    restaurants: restaurantList,
    ordersLast30Days: Number(ordersStats[0]?.count ?? 0),
    revenueLast30Days: Number(ordersStats[0]?.total ?? 0),
    totalCalls: Number(callsStats[0]?.count ?? 0),
  };
}

export default async function OrgDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const user = await getAppUser();
  if (!user) redirect("/login");

  const userOrgs = await getUserOrganizations();
  const org = userOrgs.find((o) => o.id === id);
  if (!org) redirect("/org");

  const [orgDetails] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);
  if (!orgDetails) redirect("/org");

  const [stats, usageResult] = await Promise.all([
    getOrgStats(id),
    getCallUsageForCurrentPeriod(),
  ]);

  const cookieStore = await cookies();
  const selectedRestaurantId = cookieStore.get("yallo_restaurant_id")?.value;
  const validRestaurant = stats.restaurants.find((r) => r.id === selectedRestaurantId);

  return (
    <OrgDashboard
      user={{ firstName: user.firstName, email: user.email }}
      org={{
        id: orgDetails.id,
        name: orgDetails.name,
        isActive: orgDetails.isActive,
        stripeSubscriptionStatus: orgDetails.stripeSubscriptionStatus,
        stripeCurrentPeriodEnd: orgDetails.stripeCurrentPeriodEnd,
        stripePriceId: orgDetails.stripePriceId,
        billingStartDate: orgDetails.billingStartDate,
        stripeCustomerId: orgDetails.stripeCustomerId,
      }}
      stats={stats}
      currentRestaurantId={validRestaurant?.id ?? stats.restaurants[0]?.id ?? null}
      plans={SUBSCRIPTION_PLANS}
      usage={usageResult.success ? usageResult.data : undefined}
    />
  );
}
