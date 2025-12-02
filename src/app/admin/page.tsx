import { auth, signOut } from "@/auth";
import { headers } from "next/headers";
import { buildAppUrlServer } from "@/lib/utils";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { restaurants, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddUserDialog } from "./add-user-dialog";
import { AddRestaurantDialog } from "./add-restaurant-dialog";
import { UserActionsCell } from "./user-actions-cell";
import { RestaurantActionsCell } from "./restaurant-actions-cell";
import { RestaurantStatusCell } from "./restaurant-status-cell";
import { LogOut, Users, UtensilsCrossed } from "lucide-react";

// Récupère tous les utilisateurs
async function getUsers() {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);

  return result;
}

// Récupère tous les utilisateurs OWNER (pour le dropdown)
async function getOwners() {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
    })
    .from(users)
    .where(eq(users.role, "OWNER"))
    .orderBy(users.email);

  return result;
}

// Récupère tous les restaurants avec leurs owners
async function getRestaurants() {
  const result = await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      slug: restaurants.slug,
      phoneNumber: restaurants.phoneNumber,
      ownerId: restaurants.ownerId,
      isActive: restaurants.isActive,
      createdAt: restaurants.createdAt,
      ownerEmail: users.email,
    })
    .from(restaurants)
    .innerJoin(users, eq(restaurants.ownerId, users.id))
    .orderBy(restaurants.createdAt);

  return result;
}

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Si l'utilisateur doit changer son mot de passe, redirige vers /update-password
  if (session.user.mustChangePassword === true) {
    redirect("/update-password");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [usersList, ownersList, restaurantsList] = await Promise.all([
    getUsers(),
    getOwners(),
    getRestaurants(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Dark glassmorphism */}
      <header className="border-b border-white/5 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black gradient-text">Yallo</span>
              <span className="text-muted-foreground text-sm hidden sm:block">/ Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#f6cf62] animate-pulse-dot" />
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {session.user.email}
                </span>
              </div>
              <form
                action={async () => {
                  "use server";
                  const headersList = await headers();
                  const host = headersList.get("host") || "";
                  const loginUrl = buildAppUrlServer("/login", host);
                  await signOut({ redirectTo: loginUrl });
                }}
              >
                <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-white/5">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Déconnexion</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-card/30 border border-white/5 p-1">
            <TabsTrigger 
              value="users" 
              className="flex items-center gap-2 data-[state=active]:bg-[#f6cf62]/10 data-[state=active]:text-[#f6cf62] data-[state=active]:shadow-none"
            >
              <Users className="w-4 h-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger 
              value="restaurants" 
              className="flex items-center gap-2 data-[state=active]:bg-[#f6cf62]/10 data-[state=active]:text-[#f6cf62] data-[state=active]:shadow-none"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Restaurants
            </TabsTrigger>
          </TabsList>

          {/* ============================================ */}
          {/* ONGLET UTILISATEURS */}
          {/* ============================================ */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Utilisateurs</h2>
                <p className="text-muted-foreground mt-1">
                  Gérez les comptes Admin & Owners
                </p>
              </div>
              <AddUserDialog />
            </div>

            <div className="border border-white/5 rounded-xl bg-card/20 overflow-hidden">
              {usersList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#f6cf62]/10 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-[#f6cf62]/50" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Aucun utilisateur</h3>
                  <p className="text-muted-foreground text-sm">
                    Créez votre premier utilisateur.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium">Email</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Rôle</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Inscription</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersList.map((user) => (
                      <TableRow key={user.id} className="border-white/5 hover:bg-[#f6cf62]/[0.02]">
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.role === "ADMIN"
                                ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15"
                                : "bg-[#f6cf62]/10 text-[#f6cf62] border-[#f6cf62]/20 hover:bg-[#f6cf62]/15"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <UserActionsCell
                            user={{
                              id: user.id,
                              email: user.email,
                              role: user.role as "ADMIN" | "OWNER",
                            }}
                            currentUserId={session.user.id}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {usersList.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {usersList.length} utilisateur{usersList.length > 1 ? "s" : ""}
                {" • "}
                <span className="text-red-400">{usersList.filter((u) => u.role === "ADMIN").length} admin</span>
                {" • "}
                <span className="text-[#f6cf62]">{usersList.filter((u) => u.role === "OWNER").length} owner</span>
              </div>
            )}
          </TabsContent>

          {/* ============================================ */}
          {/* ONGLET RESTAURANTS */}
          {/* ============================================ */}
          <TabsContent value="restaurants" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Restaurants</h2>
                <p className="text-muted-foreground mt-1">
                  Gérez les restaurants et leurs propriétaires
                </p>
              </div>
              <div className="flex items-center gap-2">
                {ownersList.length === 0 && (
                  <span className="text-sm text-amber-400">
                    Créez d&apos;abord un OWNER
                  </span>
                )}
                <AddRestaurantDialog owners={ownersList} />
              </div>
            </div>

            <div className="border border-white/5 rounded-xl bg-card/20 overflow-hidden">
              {restaurantsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#f6cf62]/10 flex items-center justify-center mb-4">
                    <UtensilsCrossed className="w-8 h-8 text-[#f6cf62]/50" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Aucun restaurant</h3>
                  <p className="text-muted-foreground text-sm">
                    {ownersList.length === 0
                      ? "Créez d'abord un OWNER."
                      : "Ajoutez votre premier restaurant."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium">Restaurant</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Gérant</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Téléphone</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Statut</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restaurantsList.map((restaurant) => (
                      <TableRow key={restaurant.id} className="border-white/5 hover:bg-[#f6cf62]/[0.02]">
                        <TableCell className="font-medium">
                          <div>
                            <div>{restaurant.name}</div>
                            <div className="text-xs text-muted-foreground">
                              /{restaurant.slug}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {restaurant.ownerEmail}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {restaurant.phoneNumber}
                        </TableCell>
                        <TableCell>
                          <RestaurantStatusCell
                            restaurantId={restaurant.id}
                            isActive={restaurant.isActive ?? true}
                          />
                        </TableCell>
                        <TableCell>
                          <RestaurantActionsCell
                            restaurant={{
                              id: restaurant.id,
                              name: restaurant.name,
                              phoneNumber: restaurant.phoneNumber,
                              ownerId: restaurant.ownerId,
                            }}
                            owners={ownersList}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {restaurantsList.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {restaurantsList.length} restaurant{restaurantsList.length > 1 ? "s" : ""}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
