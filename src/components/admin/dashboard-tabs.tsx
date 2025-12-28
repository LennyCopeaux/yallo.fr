"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Users } from "lucide-react";
import { RestaurantsDataTable } from "@/components/admin/restaurants-data-table";
import { UsersDataTable } from "@/components/admin/users-data-table";
import { AddRestaurantDialog } from "@/components/admin/add-restaurant-dialog";
import { AddUserDialog } from "@/components/admin/add-user-dialog";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phoneNumber: string;
  ownerId: string;
  status: "active" | "suspended" | "onboarding";
  isActive: boolean | null;
  vapiAssistantId: string | null;
  twilioPhoneNumber: string | null;
  createdAt: Date | null;
  ownerEmail: string;
  ordersCount: number;
};

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "ADMIN" | "OWNER";
  mustChangePassword: boolean;
  createdAt: Date | null;
};

type Owner = {
  id: string;
  email: string;
};

interface DashboardTabsProps {
  restaurants: Restaurant[];
  users: User[];
  owners: Owner[];
  totalOrders: number;
  defaultTab?: string;
}

export function DashboardTabs({ restaurants, users, owners, totalOrders, defaultTab = "restaurants" }: DashboardTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList className="bg-card/30 border border-border p-1 w-full sm:w-auto">
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

      {/* Onglet Restaurants */}
      <TabsContent value="restaurants" className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Restaurants</h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Gérez tous vos restaurants et leur configuration
            </p>
          </div>
          <AddRestaurantDialog owners={owners} />
        </div>

        {/* Stats rapides */}
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

        {/* DataTable */}
        <RestaurantsDataTable data={restaurants} owners={owners} />
      </TabsContent>

      {/* Onglet Utilisateurs */}
      <TabsContent value="users" className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Utilisateurs</h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Gérez les comptes administrateurs et propriétaires
            </p>
          </div>
          <AddUserDialog />
        </div>

        {/* Stats rapides */}
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
            <p className="text-xl sm:text-2xl font-bold text-amber-400">
              {users.filter(u => u.mustChangePassword).length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">En attente</p>
          </div>
        </div>

        {/* DataTable */}
        <UsersDataTable data={users} />
      </TabsContent>
    </Tabs>
  );
}
