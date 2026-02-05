import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getMenuData } from "@/features/menu/actions";
import { MenuManager } from "@/components/menu";
import Link from "next/link";
import { getUserRestaurant } from "@/features/orders/actions";
import { HubRiseInfoCard } from "@/components/dashboard/hubrise-info-card";

export default async function MenuPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.mustChangePassword === true) {
    redirect("/update-password");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const restaurant = await getUserRestaurant();
  const hasHubRise = !!(restaurant?.hubriseLocationId && restaurant?.hubriseAccessToken);

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
