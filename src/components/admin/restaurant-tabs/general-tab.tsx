"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, User } from "lucide-react";
import { toast } from "sonner";
import { updateRestaurantGeneral } from "@/app/(admin)/admin/restaurants/actions";

const formSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100, "Nom trop long"),
  slug: z.string().min(2, "Slug trop court").max(50, "Slug trop long"),
  address: z.string().max(500, "Adresse trop longue").optional(),
  ownerId: z.string().uuid("ID propriétaire invalide"),
  status: z.enum(["active", "suspended", "onboarding"]),
});

type FormValues = z.infer<typeof formSchema>;

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  ownerId: string;
  status: "active" | "suspended" | "onboarding";
  createdAt: Date | null;
  updatedAt: Date | null;
};

type Owner = {
  id: string;
  email: string;
};

interface GeneralTabProps {
  restaurant: Restaurant;
  owners: Owner[];
}

export function GeneralTab({ restaurant, owners }: GeneralTabProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: restaurant.name,
      slug: restaurant.slug,
      address: restaurant.address || "",
      ownerId: restaurant.ownerId,
      status: restaurant.status,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    
    const result = await updateRestaurantGeneral(restaurant.id, {
      name: data.name,
      slug: data.slug,
      address: data.address || null,
      ownerId: data.ownerId,
      status: data.status,
    });

    if (result.success) {
      toast.success("Restaurant mis à jour");
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }

    setIsLoading(false);
  }

  return (
    <Card className="border-border bg-card/30">
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
        <CardDescription>
          Modifiez les informations de base du restaurant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom du restaurant *</Label>
              <Input
                id="name"
                {...form.register("name")}
                disabled={isLoading}
                className="bg-background/50 border-border focus:border-primary/50"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">/</span>
                <Input
                  id="slug"
                  {...form.register("slug")}
                  disabled={isLoading}
                  className="bg-background/50 border-border focus:border-primary/50"
                />
              </div>
              {form.formState.errors.slug && (
                <p className="text-sm text-red-400">{form.formState.errors.slug.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Sert uniquement à générer l&apos;URL publique du menu (ex: yallo.fr/menu/mon-resto). Ne sert pas à la connexion.
              </p>
            </div>

            {/* Propriétaire */}
            <div className="space-y-2">
              <Label htmlFor="ownerId">Propriétaire *</Label>
              <Select
                value={form.watch("ownerId")}
                onValueChange={(value) => form.setValue("ownerId", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-background/50 border-border focus:border-primary/50">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        {owner.email}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.ownerId && (
                <p className="text-sm text-red-400">{form.formState.errors.ownerId.message}</p>
              )}
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label htmlFor="status">Statut *</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value: "active" | "suspended" | "onboarding") => form.setValue("status", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-background/50 border-border focus:border-primary/50">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="onboarding">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Onboarding
                    </span>
                  </SelectItem>
                  <SelectItem value="active">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Actif
                    </span>
                  </SelectItem>
                  <SelectItem value="suspended">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      Suspendu
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-400">{form.formState.errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              {...form.register("address")}
              disabled={isLoading}
              rows={2}
              placeholder="123 Rue du Commerce, 33000 Bordeaux"
              className="bg-background/50 border-border focus:border-primary/50 resize-none"
            />
            {form.formState.errors.address && (
              <p className="text-sm text-red-400">{form.formState.errors.address.message}</p>
            )}
          </div>

          {/* Métadonnées */}
          <div className="pt-4 border-t border-border">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                Créé le{" "}
                {restaurant.createdAt
                  ? new Date(restaurant.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </span>
              {restaurant.updatedAt && (
                <>
                  <span>•</span>
                  <span>
                    Modifié le{" "}
                    {new Date(restaurant.updatedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-black hover:bg-primary/90"
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
        </form>
      </CardContent>
    </Card>
  );
}
