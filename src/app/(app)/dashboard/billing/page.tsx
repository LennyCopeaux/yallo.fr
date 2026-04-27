import { getAppUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserRestaurant } from "@/features/orders/actions";
import { SUBSCRIPTION_PLANS } from "@/features/billing/plans";
import { BillingPageContent } from "./_components/billing-page-content";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function BillingPage() {
  const user = await getAppUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const restaurant = await getUserRestaurant();

  if (!restaurant) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Abonnement</h1>
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
                  Email de contact :{" "}
                  <a href="mailto:contact@yallo.fr" className="text-primary hover:underline">
                    contact@yallo.fr
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Abonnement</h1>
        <p className="text-muted-foreground">Gérez votre abonnement Yallo.</p>
      </div>
      <BillingPageContent
        restaurant={{
          stripeSubscriptionStatus: restaurant.stripeSubscriptionStatus,
          stripePriceId: restaurant.stripePriceId,
          billingStartDate: restaurant.billingStartDate,
          stripeCustomerId: restaurant.stripeCustomerId,
        }}
        plans={SUBSCRIPTION_PLANS}
      />
    </div>
  );
}
