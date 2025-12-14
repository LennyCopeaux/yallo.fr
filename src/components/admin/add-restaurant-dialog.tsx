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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRestaurant } from "@/app/(admin)/admin/restaurants/actions";
import { Plus, Loader2, User } from "lucide-react";
import { toast } from "sonner";

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
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    if (!selectedOwnerId) {
      toast.error("Veuillez sélectionner un propriétaire");
      return;
    }

    setIsLoading(true);
    formData.set("ownerId", selectedOwnerId);

    const result = await createRestaurant(formData);

    if (result.success) {
      toast.success("Restaurant créé avec succès");
      setOpen(false);
      setSelectedOwnerId("");
    } else {
      toast.error(result.error || "Une erreur est survenue");
    }

    setIsLoading(false);
  }

  const hasOwners = owners.length > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setSelectedOwnerId("");
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          disabled={!hasOwners}
          className="bg-primary text-black hover:bg-primary/90 font-semibold disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau restaurant
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un restaurant</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau restaurant et assignez-le à un propriétaire.
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
              <p className="text-xs text-muted-foreground">
                Le slug sera généré automatiquement à partir du nom
              </p>
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
              <p className="text-xs text-muted-foreground">
                Numéro de contact principal du restaurant
              </p>
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
              <Label htmlFor="ownerId">Propriétaire *</Label>
              <Select
                value={selectedOwnerId}
                onValueChange={setSelectedOwnerId}
                disabled={isLoading}
                required
              >
                <SelectTrigger className="bg-background/50 border-border focus:border-primary/50">
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
                Seuls les utilisateurs OWNER sont listés
              </p>
            </div>
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
              disabled={isLoading || !selectedOwnerId}
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
