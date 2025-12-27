import { auth, signOut } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Utensils, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { buildAppUrlServer } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { DashboardContent } from "./dashboard-content";
import { getOrders, getUserRestaurant } from "@/features/orders/actions";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Si l'utilisateur doit changer son mot de passe, redirige vers /update-password
  if (session.user.mustChangePassword === true) {
    redirect("/update-password");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  // Vérifier si l'utilisateur a un restaurant
  const restaurant = await getUserRestaurant();
  
  // Récupérer les commandes (sera vide si pas de restaurant)
  const ordersData = restaurant ? await getOrders() : [];
  
  // Transformer les données pour le composant
  const orders = ordersData.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    status: order.status,
    totalAmount: order.totalAmount,
    pickupTime: order.pickupTime,
    notes: order.notes,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      options: item.options,
    })),
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black gradient-text">Yallo</span>
              <span className="text-muted-foreground text-sm hidden sm:block">/ Dashboard</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {session.user.email}
                </span>
              </div>
              <ModeToggle />
              <form
                action={async () => {
                  "use server";
                  const headersList = await headers();
                  const host = headersList.get("host") || "";
                  const loginUrl = buildAppUrlServer("/login", host);
                  await signOut({ redirectTo: loginUrl });
                }}
              >
                <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent">
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue 👋
          </h1>
          {restaurant ? (
            <p className="text-muted-foreground">
              Votre assistant vocal est <span className="text-emerald-500 font-medium">en ligne</span> et prêt à prendre des commandes.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Votre compte est actif mais n&apos;est pas encore rattaché à un restaurant.
            </p>
          )}
        </div>

        {/* Alert si pas de restaurant */}
        {!restaurant && (
          <Card className="bg-amber-500/10 border-amber-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-amber-500">Aucun restaurant associé</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Votre compte n&apos;est pas encore rattaché à un restaurant. 
                    Contactez l&apos;administrateur pour qu&apos;il vous associe à votre établissement.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Email de contact : <a href="mailto:contact@yallo.fr" className="text-primary hover:underline">contact@yallo.fr</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions - seulement si restaurant */}
        {restaurant && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link href="/dashboard/menu">
              <Card className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Gestion du Menu</h3>
                      <p className="text-sm text-muted-foreground">
                        Gérez vos produits, catégories et disponibilité
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/hours">
              <Card className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Horaires d&apos;ouverture</h3>
                      <p className="text-sm text-muted-foreground">
                        Configurez vos horaires d&apos;ouverture
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* Dashboard Content with KPIs, Graph, and Orders - seulement si restaurant */}
        {restaurant && <DashboardContent orders={orders} />}
      </main>
    </div>
  );
}
