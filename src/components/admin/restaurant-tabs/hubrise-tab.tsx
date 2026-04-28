"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Link2, Key, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { updateHubriseConfig } from "@/app/(admin)/admin/restaurants/actions";
import { cn } from "@/lib/utils";
import { AdminStatusBadge } from "@/components/admin/status-badge";

const formSchema = z.object({
  hubriseLocationId: z.string().max(100, "Location ID trop long").optional(),
  hubriseAccessToken: z.string().max(500, "Token trop long").optional(),
  hubriseCatalogId: z.string().max(50, "ID catalogue trop long").optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Restaurant = {
  id: string;
  hubriseLocationId: string | null;
  hubriseAccessToken: string | null;
  hubriseCatalogId: string | null;
};

interface HubriseTabProps {
  restaurant: Restaurant;
}

export function HubriseTab({ restaurant }: Readonly<HubriseTabProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hubriseLocationId: restaurant.hubriseLocationId || "",
      hubriseAccessToken: restaurant.hubriseAccessToken || "",
      hubriseCatalogId: restaurant.hubriseCatalogId || "",
    },
  });

  const isDirty = form.formState.isDirty;

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    const result = await updateHubriseConfig(restaurant.id, {
      hubriseLocationId: data.hubriseLocationId || null,
      hubriseAccessToken: data.hubriseAccessToken || null,
      hubriseCatalogId: data.hubriseCatalogId?.trim() ? data.hubriseCatalogId.trim() : null,
    });

    if (result.success) {
      toast.success("Configuration HubRise mise à jour");
      form.reset(data); // Reset form state après succès
      router.refresh();
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }

    setIsLoading(false);
  }

  const hasConfig = !!(restaurant.hubriseLocationId && restaurant.hubriseAccessToken);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <Card className="border-border bg-card/30">
        <CardHeader>
          <CardTitle>État de la connexion HubRise</CardTitle>
          <CardDescription>
            Vérification de la configuration d&apos;accès HubRise pour ce restaurant.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Statut
              </p>
              {hasConfig ? (
                <AdminStatusBadge tone="active" label="Configuré" />
              ) : (
                <AdminStatusBadge tone="warning" label="Non configuré" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Location ID
              </p>
              <p className="font-medium">{restaurant.hubriseLocationId || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Configuration HubRise
          </CardTitle>
          <CardDescription>
            Connectez votre restaurant à HubRise pour synchroniser automatiquement le menu et les
            commandes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="hubriseLocationId">HubRise Location ID</Label>
              <div className="relative">
                <Input
                  id="hubriseLocationId"
                  {...form.register("hubriseLocationId")}
                  disabled={isLoading}
                  placeholder="ex: 19mjb-0"
                  className="bg-background/50 border-border focus:border-primary/50 pl-10"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              {form.formState.errors.hubriseLocationId && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.hubriseLocationId.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                ID du point de vente HubRise. Trouvez-le dans votre compte HubRise sous
                &quot;Locations&quot;.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hubriseAccessToken">HubRise Access Token</Label>
              <div className="relative">
                <Input
                  id="hubriseAccessToken"
                  type="text"
                  {...form.register("hubriseAccessToken")}
                  disabled={isLoading}
                  placeholder="Votre token d'accès API HubRise"
                  className="bg-background/50 border-border focus:border-primary/50 pl-10 font-mono"
                />
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              {form.formState.errors.hubriseAccessToken && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.hubriseAccessToken.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Token d&apos;accès API HubRise. Générez-le dans votre compte HubRise sous &quot;API
                Access&quot;.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hubriseCatalogId">ID catalogue HubRise (optionnel)</Label>
              <Input
                id="hubriseCatalogId"
                {...form.register("hubriseCatalogId")}
                disabled={isLoading}
                placeholder="ex: 1rbmp"
                className="bg-background/50 border-border focus:border-primary/50 font-mono"
              />
              {form.formState.errors.hubriseCatalogId && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.hubriseCatalogId.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Si le point de vente a plusieurs cartes, indique l’ID du catalogue voulu (champ{" "}
                <code className="text-muted-foreground">id</code> dans le JSON HubRise, ou colonne
                ID côté HubRise). Laisse vide pour choix auto (évite les catalogues dont le nom
                commence par « test »).
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-400/10 border border-blue-400/20">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-blue-400">Mode Hybride</p>
                <p className="text-muted-foreground">
                  Une fois connecté à HubRise, le menu et les commandes seront synchronisés
                  automatiquement.
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-end pb-6">
        <Button
          type="button"
          disabled={isLoading || !isDirty}
          onClick={form.handleSubmit(onSubmit)}
          className={cn(
            "bg-primary text-black hover:bg-primary/90",
            !isDirty && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
