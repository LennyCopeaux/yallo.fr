"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Building2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { updateRestaurantGeneral } from "@/app/(admin)/admin/restaurants/actions";
import { addRestaurantMember, removeRestaurantMember } from "@/app/(admin)/admin/actions";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100, "Nom trop long"),
  address: z.string().max(500, "Adresse trop longue").optional(),
  status: z.enum(["active", "suspended", "onboarding"]),
  organizationId: z.string().uuid().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Restaurant = {
  id: string;
  name: string;
  address: string | null;
  ownerId: string;
  status: "active" | "suspended" | "onboarding";
  organizationId?: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

type Owner = {
  id: string;
  email: string;
  role?: string;
};

type Organization = {
  id: string;
  name: string;
};

type RestaurantMember = {
  id: string;
  email: string;
};

interface GeneralTabProps {
  restaurant: Restaurant;
  owners: Owner[];
  organizations?: Organization[];
  restaurantMembers?: RestaurantMember[];
}

export function GeneralTab({ restaurant, owners, organizations = [], restaurantMembers = [] }: Readonly<GeneralTabProps>) {
  const [isLoading, setIsLoading] = useState(false);

  // Members management
  const [pendingAddMembers, setPendingAddMembers] = useState<string[]>([]);
  const [pendingRemoveMembers, setPendingRemoveMembers] = useState<string[]>([]);
  const [isSavingMembers, setIsSavingMembers] = useState(false);
  const [ownersDropdownOpen, setOwnersDropdownOpen] = useState(false);
  const ownersDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ownersDropdownRef.current && !ownersDropdownRef.current.contains(e.target as Node)) {
        setOwnersDropdownOpen(false);
      }
    }
    if (ownersDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ownersDropdownOpen]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: restaurant.name,
      address: restaurant.address || "",
      status: restaurant.status,
      organizationId: restaurant.organizationId ?? null,
    },
  });

  const statusValue = useWatch({ control: form.control, name: "status" });
  const organizationIdValue = useWatch({ control: form.control, name: "organizationId" });

  const isDirty = form.formState.isDirty;

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    const remainingCount = restaurantMembers.length + pendingAddMembers.length - pendingRemoveMembers.length;
    if (remainingCount < 1) {
      toast.error("Le restaurant doit avoir au moins un membre");
      setIsLoading(false);
      return;
    }

    if (isDirty) {
      const result = await updateRestaurantGeneral(restaurant.id, {
        name: data.name,
        address: data.address || null,
        status: data.status,
        organizationId: data.organizationId ?? null,
      });

      if (!result.success) {
        toast.error(result.error || "Erreur lors de la mise à jour");
        setIsLoading(false);
        return;
      }

      form.reset(data);
    }

    if (hasOwnerChanges) {
      setIsSavingMembers(true);
      const ops: Promise<{ success: boolean; error?: string }>[] = [];
      for (const userId of pendingAddMembers) ops.push(addRestaurantMember(restaurant.id, userId));
      for (const userId of pendingRemoveMembers) ops.push(removeRestaurantMember(restaurant.id, userId));
      const results = await Promise.all(ops);
      setIsSavingMembers(false);

      const failed = results.find((r) => !r.success);
      if (failed) {
        toast.error(failed.error ?? "Erreur lors de la mise à jour des membres");
        setIsLoading(false);
        return;
      }

      setPendingAddMembers([]);
      setPendingRemoveMembers([]);
    }

    if (isDirty || hasOwnerChanges) {
      toast.success("Restaurant mis à jour");
    }

    setIsLoading(false);
  }

  function isMemberChecked(ownerId: string) {
    const isCurrentMember = restaurantMembers.some((m) => m.id === ownerId);
    if (isCurrentMember) return !pendingRemoveMembers.includes(ownerId);
    return pendingAddMembers.includes(ownerId);
  }

  function toggleMember(ownerId: string) {
    const isCurrentMember = restaurantMembers.some((m) => m.id === ownerId);
    if (isCurrentMember) {
      setPendingRemoveMembers((prev) =>
        prev.includes(ownerId) ? prev.filter((id) => id !== ownerId) : [...prev, ownerId]
      );
    } else {
      setPendingAddMembers((prev) =>
        prev.includes(ownerId) ? prev.filter((id) => id !== ownerId) : [...prev, ownerId]
      );
    }
  }

  const hasOwnerChanges = pendingAddMembers.length > 0 || pendingRemoveMembers.length > 0;

  const isAnyDirty = isDirty || hasOwnerChanges;

  return (
    <>
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



            <div className="space-y-2">
              <Label htmlFor="status">Statut *</Label>
              <Select
                value={statusValue}
                onValueChange={(value: "active" | "suspended" | "onboarding") => form.setValue("status", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-background/50 border-border focus:border-primary/50">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="onboarding">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />{" "}
                      Onboarding
                    </span>
                  </SelectItem>
                  <SelectItem value="active">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />{" "}
                      Actif
                    </span>
                  </SelectItem>
                  <SelectItem value="suspended">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400" />{" "}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {organizations.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="organizationId">Organisation</Label>
                <Select
                  value={organizationIdValue ?? "none"}
                  onValueChange={(value) => form.setValue("organizationId", value === "none" ? null : value, { shouldDirty: true })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-background/50 border-border focus:border-primary/50">
                    <SelectValue placeholder="Aucune organisation" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="none">
                      <span className="text-muted-foreground">Aucune organisation</span>
                    </SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          {org.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Membres</Label>
              </div>
              <div ref={ownersDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setOwnersDropdownOpen((v) => !v)}
                  className="flex items-center justify-between w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm hover:bg-muted/40 transition-colors"
                >
                  <span className="text-muted-foreground">
                    {restaurantMembers.length + pendingAddMembers.length - pendingRemoveMembers.length === 0
                      ? "Aucun membre"
                      : `${restaurantMembers.length + pendingAddMembers.length - pendingRemoveMembers.length} membre${restaurantMembers.length + pendingAddMembers.length - pendingRemoveMembers.length > 1 ? "s" : ""}`}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-150 ${ownersDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {ownersDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                    {owners.map((owner) => (
                      <label
                        key={owner.id}
                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <Checkbox
                          checked={isMemberChecked(owner.id)}
                          onCheckedChange={() => toggleMember(owner.id)}
                          disabled={isSavingMembers}
                          className="shrink-0"
                        />
                        <span className="text-sm truncate flex-1">{owner.email}</span>
                        {owner.role && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${
                            owner.role === "OWNER"
                              ? "bg-primary/15 text-primary"
                              : "bg-blue-500/10 text-blue-400"
                          }`}>
                            {owner.role === "OWNER" ? "Owner" : "Employee"}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

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
        </form>
      </CardContent>
    </Card>
    
    <div className="flex justify-end mt-6">
      <Button
        type="button"
        disabled={isLoading || !isAnyDirty}
        onClick={form.handleSubmit(onSubmit)}
        className={cn(
          "bg-primary text-black hover:bg-primary/90",
          !isAnyDirty && "opacity-50 cursor-not-allowed"
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
    </>
  );
}
