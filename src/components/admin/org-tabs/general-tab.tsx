"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  updateOrganization,
  addOrganizationMember,
  removeOrganizationMember,
  setRestaurantOrganization,
} from "@/app/(admin)/admin/actions";
import type { OrgDetail, OrgMember, OrgRestaurant } from "@/components/admin/org-detail-tabs";

const formSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100, "Nom trop long"),
  status: z.enum(["active", "suspended", "onboarding"]),
});

type FormValues = z.infer<typeof formSchema>;

interface OrgGeneralTabProps {
  org: OrgDetail;
  owners: OrgMember[];
  members: OrgMember[];
  assignedRestaurants: OrgRestaurant[];
  allRestaurants: OrgRestaurant[];
}

export function OrgGeneralTab({
  org,
  owners,
  members,
  assignedRestaurants,
  allRestaurants,
}: Readonly<OrgGeneralTabProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  // Restaurants management
  const [pendingAddRestaurants, setPendingAddRestaurants] = useState<string[]>([]);
  const [pendingRemoveRestaurants, setPendingRemoveRestaurants] = useState<string[]>([]);
  const [isSavingRestaurants, setIsSavingRestaurants] = useState(false);
  const [restaurantsOpen, setRestaurantsOpen] = useState(false);
  const restaurantsRef = useRef<HTMLDivElement>(null);

  // Owners management
  const [pendingAddMembers, setPendingAddMembers] = useState<string[]>([]);
  const [pendingRemoveMembers, setPendingRemoveMembers] = useState<string[]>([]);
  const [isSavingMembers, setIsSavingMembers] = useState(false);
  const [ownersOpen, setOwnersOpen] = useState(false);
  const ownersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (restaurantsRef.current && !restaurantsRef.current.contains(e.target as Node)) {
        setRestaurantsOpen(false);
      }
    }
    if (restaurantsOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [restaurantsOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ownersRef.current && !ownersRef.current.contains(e.target as Node)) {
        setOwnersOpen(false);
      }
    }
    if (ownersOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ownersOpen]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: org.name,
      status: (org.status as "active" | "suspended" | "onboarding") || "active",
    },
  });

  const statusValue = useWatch({ control: form.control, name: "status" });
  const isDirty = form.formState.isDirty;

  // Restaurant helpers
  function isRestaurantChecked(rId: string) {
    const isAssigned = assignedRestaurants.some((r) => r.id === rId);
    if (isAssigned) return !pendingRemoveRestaurants.includes(rId);
    return pendingAddRestaurants.includes(rId);
  }

  function toggleRestaurant(rId: string) {
    const isAssigned = assignedRestaurants.some((r) => r.id === rId);
    if (isAssigned) {
      setPendingRemoveRestaurants((prev) =>
        prev.includes(rId) ? prev.filter((id) => id !== rId) : [...prev, rId]
      );
    } else {
      setPendingAddRestaurants((prev) =>
        prev.includes(rId) ? prev.filter((id) => id !== rId) : [...prev, rId]
      );
    }
  }

  const currentRestaurantCount =
    assignedRestaurants.length + pendingAddRestaurants.length - pendingRemoveRestaurants.length;
  const hasRestaurantChanges =
    pendingAddRestaurants.length > 0 || pendingRemoveRestaurants.length > 0;

  async function savePendingRestaurants(): Promise<{ success: boolean; error?: string }> {
    if (!hasRestaurantChanges) return { success: true };

    setIsSavingRestaurants(true);
    const ops = [
      ...pendingAddRestaurants.map((rId) => setRestaurantOrganization(rId, org.id)),
      ...pendingRemoveRestaurants.map((rId) => setRestaurantOrganization(rId, null)),
    ];
    const results = await Promise.all(ops);
    setIsSavingRestaurants(false);

    const failed = results.find((r) => !r.success);
    if (failed) return { success: false, error: failed.error ?? "Erreur" };

    setPendingAddRestaurants([]);
    setPendingRemoveRestaurants([]);
    return { success: true };
  }

  // Owner helpers
  function isMemberChecked(ownerId: string) {
    const isCurrentMember = members.some((m) => m.id === ownerId);
    if (isCurrentMember) return !pendingRemoveMembers.includes(ownerId);
    return pendingAddMembers.includes(ownerId);
  }

  function toggleMember(ownerId: string) {
    const isCurrentMember = members.some((m) => m.id === ownerId);
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

  const currentMemberCount =
    members.length + pendingAddMembers.length - pendingRemoveMembers.length;
  const hasOwnerChanges = pendingAddMembers.length > 0 || pendingRemoveMembers.length > 0;

  async function savePendingOwners(): Promise<{ success: boolean; error?: string }> {
    if (!hasOwnerChanges) return { success: true };
    if (currentMemberCount < 1) {
      return { success: false, error: "L'organisation doit avoir au moins un membre" };
    }

    setIsSavingMembers(true);
    const ops = [
      ...pendingAddMembers.map((userId) => addOrganizationMember(org.id, userId)),
      ...pendingRemoveMembers.map((userId) => removeOrganizationMember(org.id, userId)),
    ];
    const results = await Promise.all(ops);
    setIsSavingMembers(false);

    const failed = results.find((r) => !r.success);
    if (failed) return { success: false, error: failed.error ?? "Erreur" };

    setPendingAddMembers([]);
    setPendingRemoveMembers([]);
    return { success: true };
  }

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    if (currentMemberCount < 1) {
      toast.error("L'organisation doit avoir au moins un membre");
      setIsLoading(false);
      return;
    }

    if (isDirty) {
      const result = await updateOrganization(org.id, {
        name: data.name,
        status: data.status,
      });
      if (!result.success) {
        toast.error(result.error || "Erreur lors de la mise à jour");
        setIsLoading(false);
        return;
      }
      form.reset(data);
    }

    const restaurantsResult = await savePendingRestaurants();
    if (!restaurantsResult.success) {
      toast.error(restaurantsResult.error || "Erreur lors de la mise à jour des restaurants");
      setIsLoading(false);
      return;
    }

    const ownersResult = await savePendingOwners();
    if (!ownersResult.success) {
      toast.error(ownersResult.error || "Erreur lors de la mise à jour des membres");
      setIsLoading(false);
      return;
    }

    if (isDirty || hasRestaurantChanges || hasOwnerChanges) {
      toast.success("Organisation mise à jour");
    }

    setIsLoading(false);
  }

  const isAnyDirty = isDirty || hasRestaurantChanges || hasOwnerChanges;

  return (
    <>
      <Card className="border-border bg-card/30">
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>Modifiez les informations de base de l&apos;organisation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Row 1: Nom + Statut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="org-name">Nom de l&apos;organisation *</Label>
                <Input
                  id="org-name"
                  {...form.register("name")}
                  disabled={isLoading}
                  className="bg-background/50 border-border focus:border-primary/50"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-status">Statut *</Label>
                <Select
                  value={statusValue}
                  onValueChange={(value: "active" | "suspended" | "onboarding") =>
                    form.setValue("status", value, { shouldDirty: true })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-background/50 border-border focus:border-primary/50">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="onboarding">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" /> Onboarding
                      </span>
                    </SelectItem>
                    <SelectItem value="active">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> Actif
                      </span>
                    </SelectItem>
                    <SelectItem value="suspended">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400" /> Suspendu
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Restaurants + Membres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Restaurants */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Restaurants</Label>
                </div>
                <div ref={restaurantsRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setRestaurantsOpen((v) => !v)}
                    className="flex items-center justify-between w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm hover:bg-muted/40 transition-colors"
                  >
                    <span className="text-muted-foreground">
                      {currentRestaurantCount === 0
                        ? "Aucun restaurant"
                        : `${currentRestaurantCount} restaurant${currentRestaurantCount > 1 ? "s" : ""}`}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-150 ${restaurantsOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {restaurantsOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                      {allRestaurants.length === 0 ? (
                        <p className="text-sm text-muted-foreground px-3 py-2.5">Aucun restaurant disponible</p>
                      ) : (
                        allRestaurants.map((r) => (
                          <label
                            key={r.id}
                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                          >
                            <Checkbox
                              checked={isRestaurantChecked(r.id)}
                              onCheckedChange={() => toggleRestaurant(r.id)}
                              disabled={isSavingRestaurants}
                              className="shrink-0"
                            />
                            <span className="text-sm truncate">{r.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Membres */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Membres</Label>
                </div>
                <div ref={ownersRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setOwnersOpen((v) => !v)}
                    className="flex items-center justify-between w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm hover:bg-muted/40 transition-colors"
                  >
                    <span className="text-muted-foreground">
                      {currentMemberCount === 0
                        ? "Aucun membre"
                        : `${currentMemberCount} membre${currentMemberCount > 1 ? "s" : ""}`}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-150 ${ownersOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {ownersOpen && (
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
                          {"role" in owner && (
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${
                              (owner as { role: string }).role === "OWNER"
                                ? "bg-primary/15 text-primary"
                                : "bg-blue-500/10 text-blue-400"
                            }`}>
                              {(owner as { role: string }).role === "OWNER" ? "Owner" : "Employee"}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>
                  Créée le{" "}
                  {org.createdAt
                    ? new Date(org.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </span>
                {org.updatedAt && (
                  <>
                    <span>•</span>
                    <span>
                      Modifiée le{" "}
                      {new Date(org.updatedAt).toLocaleDateString("fr-FR", {
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

