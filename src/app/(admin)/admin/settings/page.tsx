import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft } from "lucide-react";
import { PricingSettingsFormWrapperWithCard } from "@/components/admin";
import { getPricingConfig } from "./actions";
import Link from "next/link";

export default async function SettingsPage() {
  const pricingConfig = await getPricingConfig();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="mt-1 shrink-0 h-10 w-10 sm:h-9 sm:w-9"
        >
          <Link href="/admin">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Configuration globale de la plateforme Yallo
          </p>
        </div>
      </div>

      <PricingSettingsFormWrapperWithCard initialConfig={pricingConfig} />
    </div>
  );
}
