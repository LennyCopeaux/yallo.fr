"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Users, Building2 } from "lucide-react";
import { RestaurantsDataTable } from "@/components/admin/restaurants-data-table";
import { UsersDataTable } from "@/components/admin/users-data-table";
import { AddRestaurantDialog } from "@/components/admin/add-restaurant-dialog";
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { OrganizationsDataTable } from "@/components/admin/organizations-data-table";
import { AddOrganizationDialog } from "@/components/admin/add-organization-dialog";
import { type OrganizationRow } from "@/app/(admin)/admin/queries";

type Restaurant = {
  id: string;
  name: string;
  address: string | null;
  phoneNumber: string;
  ownerId: string;
  status: "active" | "suspended" | "onboarding";
  isActive: boolean | null;
  vapiAssistantId: string | null;
  twilioPhoneNumber: string | null;
  createdAt: Date | null;
  ownerEmail: string;
  owners: string[];
  ordersCount: number;
};

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "ADMIN" | "OWNER" | "EMPLOYEE";
  createdAt: Date | null;
};

type Owner = {
  id: string;
  email: string;
  role: string;
};

interface DashboardTabsProps {
  restaurants: Restaurant[];
  users: User[];
  owners: Owner[];
  totalOrders: number;
  organizations: OrganizationRow[];
  defaultTab?: string;
}

export function DashboardTabs({ restaurants, users, owners, totalOrders, organizations, defaultTab = "organizations" }: Readonly<DashboardTabsProps>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const urlTab = searchParams.get("tab") || defaultTab;
  const [activeTab, setActiveTab] = useState(urlTab);

  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    startTransition(() => {
      router.replace(`/admin?tab=${value}`);
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="bg-card/30 border border-border p-1 w-full sm:w-auto">
        <TabsTrigger 
          value="organizations" 
          className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
        >
          <Building2 className="w-4 h-4" />
          Organisations
        </TabsTrigger>
        <TabsTrigger 
          value="restaurants" 
          className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
        >
          <UtensilsCrossed className="w-4 h-4" />
          Restaurants
        </TabsTrigger>
        <TabsTrigger 
          value="users" 
          className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
        >
          <Users className="w-4 h-4" />
          Utilisateurs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="organizations" className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Organisations</h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Gérez les organisations et leurs abonnements
            </p>
          </div>
          <AddOrganizationDialog owners={owners} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold">{organizations.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold text-emerald-400">
              {organizations.filter(o => o.status === "active").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Actives</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold text-amber-400">
              {organizations.filter(o => o.status === "onboarding").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Onboarding</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold text-red-400">
              {organizations.filter(o => o.status === "suspended").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Suspendues</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold text-cyan-400">
              {organizations.filter(o => o.stripeSubscriptionStatus === "active").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Abonnées Stripe</p>
          </div>
        </div>

        <OrganizationsDataTable organizations={organizations} owners={owners} />
      </TabsContent>

      <TabsContent value="restaurants" className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Restaurants</h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Gérez tous vos restaurants et leur configuration
            </p>
          </div>
          <AddRestaurantDialog owners={owners} organizations={organizations} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold">{restaurants.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold text-emerald-400">
              {restaurants.filter(r => r.status === "active").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Actifs</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold text-amber-400">
              {restaurants.filter(r => r.status === "onboarding").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Onboarding</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold text-red-400">
              {restaurants.filter(r => r.status === "suspended").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Suspendu</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold text-cyan-400">
              {restaurants.filter(r => r.vapiAssistantId).length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">IA Active</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold text-purple-400">
              {totalOrders}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Commandes</p>
          </div>
        </div>

        <RestaurantsDataTable data={restaurants} />
      </TabsContent>

      <TabsContent value="users" className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Utilisateurs</h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Gérez les comptes et leurs accès
            </p>
          </div>
          <AddUserDialog />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold">{users.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold text-red-400">
              {users.filter(u => u.role === "ADMIN").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Admins</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold text-primary">
              {users.filter(u => u.role === "OWNER").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Owners</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/30">
            <p className="text-xl sm:text-2xl font-bold text-blue-400">
              {users.filter(u => u.role === "EMPLOYEE").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Employees</p>
          </div>
        </div>

        <UsersDataTable data={users} />
      </TabsContent>
    </Tabs>
  );
}
