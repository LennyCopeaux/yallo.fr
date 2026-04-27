import { getAppUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { getMenuData } from "@/features/menu/actions";
import { MenuManager } from "@/components/menu";
import Link from "next/link";
import { getUserRestaurant } from "@/features/orders/actions";
import { HubRiseInfoCard } from "@/components/dashboard/hubrise-info-card";

export default async function MenuPage() {
  const user = await getAppUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const restaurant = await getUserRestaurant();

  // Pas de restaurant associé
  if (!restaurant) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </Link>
        <Card className="bg-amber-500/10 border-amber-500/30">
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
      </div>
    );
  }

  const hasHubRise = !!(restaurant.hubriseLocationId && restaurant.hubriseAccessToken);

  // Si HubRise est configuré, afficher une page spéciale
  if (hasHubRise) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestion du Menu</h1>
          <p className="text-muted-foreground">
            Votre menu est synchronisé automatiquement avec HubRise
          </p>
        </div>

        <HubRiseInfoCard />
      </div>
    );
  }

  const menuData = await getMenuData();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestion du Menu</h1>
        <p className="text-muted-foreground mt-2">
          Importez votre menu via photo ou modifiez-le manuellement en JSON.
        </p>
      </div>

      <MenuManager initialMenuData={menuData} />
    </div>
  );
}
