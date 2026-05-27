"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { createRestaurant } from "@/app/(admin)/admin/actions";
import { Plus, Loader2, Building2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

type Owner = {
  id: string;
  email: string;
  role: string;
};

type Organization = {
  id: string;
  name: string;
};

interface AddRestaurantDialogProps {
  owners: Owner[];
  organizations?: Organization[];
}

export function AddRestaurantDialog({ owners, organizations = [] }: Readonly<AddRestaurantDialogProps>) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<string[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("none");
  const [ownersOpen, setOwnersOpen] = useState(false);

  function toggleOwner(id: string) {
    setSelectedOwnerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(formData: FormData) {
    if (selectedOwnerIds.length === 0) {
      toast.error("Sélectionnez au moins un membre");
      return;
    }

    setIsLoading(true);
    formData.set("ownerIds", selectedOwnerIds.join(","));
    if (selectedOrgId && selectedOrgId !== "none") {
      formData.set("organizationId", selectedOrgId);
    }

    const result = await createRestaurant(formData);

    setIsLoading(false);
    if (result.success) {
      toast.success("Restaurant créé avec succès");
      setOpen(false);
      setSelectedOwnerIds([]);
      setSelectedOrgId("none");
    } else {
      toast.error(result.error || "Une erreur est survenue");
    }
  }

  const hasOwners = owners.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setSelectedOwnerIds([]);
          setSelectedOrgId("none");
          setOwnersOpen(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          disabled={!hasOwners}
          className="bg-primary text-black hover:bg-primary/90 font-semibold disabled:opacity-50 min-h-[44px]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau restaurant
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un restaurant</DialogTitle>
          <DialogDescription>
          Ajoutez un nouveau restaurant et assignez-le à un ou plusieurs membres.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du restaurant *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Istanbul Kebab Bordeaux"
                required
                disabled={isLoading}
                className="bg-background/50 border-border focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Numéro de téléphone *</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+33612345678"
                required
                disabled={isLoading}
                className="bg-background/50 border-border focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="123 Rue du Commerce, 33000 Bordeaux"
                disabled={isLoading}
                rows={2}
                className="bg-background/50 border-border focus:border-primary/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Membres *</Label>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setOwnersOpen((v) => !v)}
                className="flex items-center justify-between w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm hover:bg-muted/40 transition-colors disabled:opacity-50"
              >
                <span className="text-muted-foreground">
                  {selectedOwnerIds.length === 0
                    ? "Sélectionner des membres"
                    : `${selectedOwnerIds.length} sélectionné${selectedOwnerIds.length > 1 ? "s" : ""}`}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-150 ${ownersOpen ? "rotate-180" : ""}`} />
              </button>
              {ownersOpen && (
                <div className="rounded-lg border border-border bg-background/30 max-h-40 overflow-y-auto">
                  {owners.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-3 py-2">Aucun utilisateur disponible</p>
                  ) : (
                    owners.map((owner) => (
                      <label
                        key={owner.id}
                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <Checkbox
                          checked={selectedOwnerIds.includes(owner.id)}
                          onCheckedChange={() => toggleOwner(owner.id)}
                          disabled={isLoading}
                          className="shrink-0"
                        />
                        <span className="text-sm truncate flex-1">{owner.email}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${
                          owner.role === "OWNER"
                            ? "bg-primary/15 text-primary"
                            : "bg-blue-500/10 text-blue-400"
                        }`}>{owner.role === "OWNER" ? "Owner" : "Employee"}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {organizations.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="organizationId">Organisation</Label>
                <Select
                  value={selectedOrgId}
                  onValueChange={setSelectedOrgId}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-background/50 border-border focus:border-primary/50">
                    <SelectValue placeholder="Sélectionner une organisation (optionnel)" />
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="border-border hover:bg-muted/50"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedOwnerIds.length === 0}
              className="bg-primary text-black hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le restaurant"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

