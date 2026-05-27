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
import { Checkbox } from "@/components/ui/checkbox";
import { createOrganization } from "@/app/(admin)/admin/actions";
import { Plus, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

type Owner = {
  id: string;
  email: string;
  role: string;
};

interface AddOrganizationDialogProps {
  owners: Owner[];
}

export function AddOrganizationDialog({ owners }: Readonly<AddOrganizationDialogProps>) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<string[]>([]);
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

    const result = await createOrganization(formData);

    setIsLoading(false);
    if (!result.success) {
      toast.error(result.error ?? "Une erreur est survenue");
      return;
    }

    toast.success("Organisation créée");
    setOpen(false);
    setSelectedOwnerIds([]);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) { setSelectedOwnerIds([]); setOwnersOpen(false); }
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-primary text-black hover:bg-primary/90 font-semibold min-h-[44px]">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle organisation
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Créer une organisation</DialogTitle>
          <DialogDescription>
            Une organisation regroupe un ou plusieurs restaurants sous un même abonnement.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="org-create-name">Nom de l&apos;organisation</Label>
            <Input
              id="org-create-name"
              name="name"
              placeholder="Ex : Groupe Dupont"
              required
              minLength={2}
              maxLength={100}
              className="bg-background/50 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Membres</Label>
            <button
              type="button"
              onClick={() => setOwnersOpen((v) => !v)}
              className="flex items-center justify-between w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm hover:bg-muted/40 transition-colors"
            >
              <span className="text-muted-foreground">
                {selectedOwnerIds.length === 0
                  ? "Sélectionner des membres"
                  : `${selectedOwnerIds.length} sélectionné${selectedOwnerIds.length > 1 ? "s" : ""}`}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-150 ${ownersOpen ? "rotate-180" : ""}`} />
            </button>
            {ownersOpen && (
              <div className="rounded-lg border border-border bg-background/30 max-h-48 overflow-y-auto">
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="border-border"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedOwnerIds.length === 0}
              className="bg-primary text-black hover:bg-primary/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

