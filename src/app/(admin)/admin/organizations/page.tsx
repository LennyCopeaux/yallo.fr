import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { OrganizationsDataTable } from "@/components/admin/organizations-data-table";
import { AddOrganizationDialog } from "@/components/admin/add-organization-dialog";
import { getOrganizationsWithRestaurants } from "@/app/(admin)/admin/queries";
import { getOwners } from "@/app/(admin)/admin/queries";

export default async function OrganizationsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ status?: string; search?: string }>;
}>) {
  const params = await searchParams;
  const [organizations, owners] = await Promise.all([
    getOrganizationsWithRestaurants(params),
    getOwners(),
  ]);

  const activeCount = organizations.filter((o) => o.status === "active").length;
  const onboardingCount = organizations.filter((o) => o.status === "onboarding").length;
  const suspendedCount = organizations.filter((o) => o.status === "suspended").length;
  const stripeCount = organizations.filter(
    (o) => o.stripeSubscriptionStatus === "active"
  ).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Organisations</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les organisations et leurs abonnements
          </p>
        </div>
        <AddOrganizationDialog owners={owners} />
      </div>

      {}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/30">
          <p className="text-2xl font-bold">{organizations.length}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/30">
          <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
          <p className="text-sm text-muted-foreground">Actives</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/30">
          <p className="text-2xl font-bold text-amber-400">{onboardingCount}</p>
          <p className="text-sm text-muted-foreground">Onboarding</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/30">
          <p className="text-2xl font-bold text-red-400">{suspendedCount}</p>
          <p className="text-sm text-muted-foreground">Suspendues</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/30">
          <p className="text-2xl font-bold text-cyan-400">{stripeCount}</p>
          <p className="text-sm text-muted-foreground">Abonnées</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/30">
          <p className="text-2xl font-bold text-primary">
            {organizations.reduce((s, o) => s + o.restaurantCount, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Restaurants</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <OrganizationsDataTable organizations={organizations} owners={owners} />
      </Suspense>
    </div>
  );
}
