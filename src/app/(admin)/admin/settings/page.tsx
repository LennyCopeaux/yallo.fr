import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Bell, Shield, Palette, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Configuration globale de la plateforme Yallo
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="border-border bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Général
            </CardTitle>
            <CardDescription>
              Paramètres généraux de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Configuration à venir</p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-400" />
              Notifications
            </CardTitle>
            <CardDescription>
              Gérer les alertes et notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Configuration à venir</p>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Paramètres de sécurité et authentification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Configuration à venir</p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-border bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-cyan-400" />
              Apparence
            </CardTitle>
            <CardDescription>
              Personnalisation de l&apos;interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Configuration à venir</p>
            </div>
          </CardContent>
        </Card>

        {/* API & Integrations */}
        <Card className="border-border bg-card/30 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              Intégrations
            </CardTitle>
            <CardDescription>
              Configuration des services tiers (Vapi, Twilio, Stripe)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold text-sm">V</span>
                  </div>
                  <div>
                    <p className="font-medium">Vapi</p>
                    <p className="text-xs text-muted-foreground">Voice AI</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Configuration globale à venir
                </p>
              </div>

              <div className="p-4 rounded-lg border border-border bg-card/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-400/10 flex items-center justify-center">
                    <span className="text-red-400 font-bold text-sm">T</span>
                  </div>
                  <div>
                    <p className="font-medium">Twilio</p>
                    <p className="text-xs text-muted-foreground">Téléphonie</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Configuration globale à venir
                </p>
              </div>

              <div className="p-4 rounded-lg border border-border bg-card/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#635BFF]/10 flex items-center justify-center">
                    <span className="text-[#635BFF] font-bold text-sm">S</span>
                  </div>
                  <div>
                    <p className="font-medium">Stripe</p>
                    <p className="text-xs text-muted-foreground">Paiements</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Configuration globale à venir
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

