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
import { createUser } from "../../actions";
import { Plus, Loader2, Shield, User } from "lucide-react";
import { toast } from "sonner";

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    if (!selectedRole) {
      toast.error("Veuillez sélectionner un rôle");
      return;
    }

    setIsLoading(true);
    formData.set("role", selectedRole);

    const result = await createUser(formData);

    if (result.success) {
      toast.success("Utilisateur créé - Un email a été envoyé avec les identifiants");
      setOpen(false);
      setSelectedRole("");
    } else {
      toast.error(result.error || "Une erreur est survenue");
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setSelectedRole("");
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-black hover:bg-primary/90 font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un utilisateur</DialogTitle>
          <DialogDescription>
            Un email sera envoyé avec un mot de passe temporaire.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="utilisateur@exemple.com"
                required
                disabled={isLoading}
                className="bg-background/50 border-border focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
                disabled={isLoading}
                required
              >
                <SelectTrigger className="bg-background/50 border-border focus:border-primary/50">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="OWNER">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <div>
                        <span className="font-medium">Owner</span>
                        <span className="text-muted-foreground ml-2">— Propriétaire de restaurant</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      <div>
                        <span className="font-medium">Admin</span>
                        <span className="text-muted-foreground ml-2">— Accès complet</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Les Owners ne peuvent gérer que leur restaurant
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
              disabled={isLoading || !selectedRole}
              className="bg-primary text-black hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer et envoyer l'email"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

