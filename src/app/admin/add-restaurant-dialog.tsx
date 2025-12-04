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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRestaurant } from "./actions";
import { Plus, Loader2, User } from "lucide-react";

type Owner = {
  id: string;
  email: string;
};

interface AddRestaurantDialogProps {
  owners: Owner[];
}

export function AddRestaurantDialog({ owners }: AddRestaurantDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsLoading(true);

    formData.set("ownerId", selectedOwnerId);

    const result = await createRestaurant(formData);

    if (result.success) {
      setOpen(false);
      setSelectedOwnerId("");
    } else {
      setError(result.error || "Une erreur est survenue");
    }

    setIsLoading(false);
  }

  const hasOwners = owners.length > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setError("");
        setSelectedOwnerId("");
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          disabled={!hasOwners}
          className="bg-primary text-primary-foreground hover:bg-primary/90 btn-shine font-semibold disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Créer un restaurant
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle>Nouveau restaurant</DialogTitle>
          <DialogDescription>
            Créez un restaurant et assignez-le à un propriétaire.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du restaurant</Label>
              <Input
                id="name"
                name="name"
                placeholder="Istanbul Kebab Bordeaux"
                required
                disabled={isLoading}
                className="bg-background/50 border-border focus:border-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+33612345678"
                required
                disabled={isLoading}
                className="bg-background/50 border-border focus:border-ring"
              />
              <p className="text-xs text-muted-foreground">
                Numéro qui recevra les commandes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerId">Propriétaire</Label>
              <Select
                value={selectedOwnerId}
                onValueChange={setSelectedOwnerId}
                disabled={isLoading}
                required
              >
                <SelectTrigger className="bg-background/50 border-border focus:border-ring">
                  <SelectValue placeholder="Sélectionner un propriétaire" />
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
              <p className="text-xs text-muted-foreground">
                Seuls les OWNER sont listés
              </p>
            </div>

            {error && (
              <p className="text-sm text-center bg-destructive/10 text-destructive p-2 rounded-md border border-destructive/20">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="border-border hover:bg-accent"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !selectedOwnerId}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
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
