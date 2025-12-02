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
import { createUser } from "./actions";
import { Plus, Loader2 } from "lucide-react";

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsLoading(true);

    formData.set("role", role);

    const result = await createUser(formData);

    if (result.success) {
      setOpen(false);
      setRole("");
    } else {
      setError(result.error || "Une erreur est survenue");
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setError("");
        setRole("");
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-[#f6cf62] text-black hover:bg-[#f6cf62]/90 btn-shine font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Créer un utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle>Inviter un utilisateur</DialogTitle>
          <DialogDescription>
            Un email avec un mot de passe temporaire sera envoyé à l&apos;utilisateur. Il devra le changer lors de sa première connexion.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="utilisateur@exemple.com"
                required
                disabled={isLoading}
                className="bg-background/50 border-white/10 focus:border-[#f6cf62]/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={role}
                onValueChange={setRole}
                disabled={isLoading}
                required
              >
                <SelectTrigger className="bg-background/50 border-white/10 focus:border-[#f6cf62]/50">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="OWNER">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#f6cf62]" />
                      OWNER - Gérant
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      ADMIN - Super admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
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
              className="border-white/10 hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !role}
              className="bg-[#f6cf62] text-black hover:bg-[#f6cf62]/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer l'utilisateur"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
