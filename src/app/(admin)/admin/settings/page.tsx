import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, CreditCard } from "lucide-react";
import { PricingSettingsForm } from "./_components/pricing-settings-form";
import { getPricingConfig } from "./actions";

export default async function SettingsPage() {
  const pricingConfig = await getPricingConfig();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Configuration globale de la plateforme Yallo
        </p>
      </div>

      {/* Pricing Settings */}
      <Card className="border-border bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Configuration des Prix
          </CardTitle>
          <CardDescription>
            Gérez les prix de l&apos;offre Yallo Infinity. Les modifications sont immédiatement visibles sur la page marketing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PricingSettingsForm initialConfig={pricingConfig} />
        </CardContent>
      </Card>
    </div>
  );
}
