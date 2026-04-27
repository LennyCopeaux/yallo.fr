import { getAppUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { DashboardContent } from "./dashboard-content";
import { getOrders, getUserRestaurant } from "@/features/orders/actions";
import { UpdateAssistantButton } from "@/components/dashboard/update-assistant-button";
import { getKitchenStatus, type StatusSettings } from "@/features/kitchen-status/actions";
import { KitchenStatusControl } from "@/components/kitchen-status";

export default async function DashboardPage() {
  const user = await getAppUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  // Vérifier si l'utilisateur a un restaurant
  const restaurant = await getUserRestaurant();
  
  // Récupérer les commandes (sera vide si pas de restaurant)
  const ordersData = restaurant ? await getOrders() : [];
  
  // Récupérer le statut de la cuisine
  const kitchenStatus = restaurant ? await getKitchenStatus() : null;
  
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue
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

        {/* Sélecteur de Charge Cuisine - seulement si restaurant */}
        {restaurant && kitchenStatus && (
          <div className="mb-6">
            <KitchenStatusControl
              currentStatus={kitchenStatus.currentStatus}
              statusSettings={kitchenStatus.statusSettings as StatusSettings | null}
            />
          </div>
        )}

        {/* Quick Actions - seulement si restaurant */}
        {restaurant && (
          <>
            {restaurant.elevenLabsAgentId && (
              <Card className="bg-card border-border mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Assistant IA Vocal</h3>
                      <p className="text-sm text-muted-foreground">
                        Mettez à jour votre assistant IA après avoir modifié votre menu
                      </p>
                    </div>
                    <UpdateAssistantButton restaurantId={restaurant.id} />
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Dashboard Content with KPIs, Graph, and Orders - seulement si restaurant */}
        {restaurant && <DashboardContent orders={orders} />}
    </div>
  );
}
