import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { DashboardContent } from "./dashboard-content";
import {
  getDashboardMetrics,
  getRestaurantCallStats,
  getUserRestaurant,
} from "@/features/orders/actions";
import { requireDashboardAccess } from "@/lib/dashboard-guard";

export default async function DashboardPage() {
  await requireDashboardAccess();

  const restaurant = await getUserRestaurant();

  const [metrics, callStats] = restaurant
    ? await Promise.all([getDashboardMetrics(), getRestaurantCallStats()])
    : [null, null];

  const assistantOnline = Boolean(restaurant?.vapiAssistantId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue
          </h1>
          {restaurant ? (
            <p className="text-muted-foreground">
              {assistantOnline ? (
                <>
                  Votre assistant vocal est{" "}
                  <span className="text-emerald-500 font-medium">en ligne</span> et prêt à
                  prendre des commandes.
                </>
              ) : (
                <>
                  Votre assistant vocal est{" "}
                  <span className="text-amber-500 font-medium">en cours de configuration</span>.
                  Il ne prend pas encore d&apos;appels.
                </>
              )}
            </p>
          ) : (
            <p className="text-muted-foreground">
              Votre compte est actif mais n&apos;est pas encore rattaché à un restaurant.
            </p>
          )}
        </div>

        {}
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

        {}
        {restaurant && metrics && (
          <DashboardContent metrics={metrics} callStats={callStats} />
        )}
    </div>
  );
}
