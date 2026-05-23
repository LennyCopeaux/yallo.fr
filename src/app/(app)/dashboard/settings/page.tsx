import { getAppUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Settings, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getCallForwardingSettings } from "@/features/settings/actions";
import { CallForwardingCard } from "@/components/settings/call-forwarding-card";
import type { CallForwardingSettings } from "@/features/settings/actions";

export default async function SettingsPage() {
  const user = await getAppUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const settingsResult = await getCallForwardingSettings();

  if (!settingsResult.success) {
    const isNoRestaurant = settingsResult.error === "Aucun restaurant trouvé";
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </Link>
        {isNoRestaurant ? (
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-amber-500">
                    Aucun restaurant associé
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Votre compte n&apos;est pas encore rattaché à un restaurant. Contactez
                    l&apos;administrateur pour qu&apos;il vous associe à votre établissement.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Email de contact :{" "}
                    <a
                      href="mailto:contact@yallo.fr"
                      className="text-primary hover:underline"
                    >
                      contact@yallo.fr
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {settingsResult.error || "Erreur lors du chargement"}
            </p>
          </div>
        )}
      </div>
    );
  }

  const settings = settingsResult.data as CallForwardingSettings;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/dashboard">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Button>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Paramètres</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Configurez le comportement de votre assistant vocal
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {/* Call forwarding section */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            Gestion des appels
          </h2>
          <CallForwardingCard initialData={settings} />
        </div>
      </div>
    </div>
  );
}
