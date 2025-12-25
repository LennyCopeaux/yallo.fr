"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { updateUser } from "@/app/(admin)/admin/actions";
import { Loader2, Shield, User } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("Email invalide"),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  role: z.enum(["ADMIN", "OWNER"]),
});

type FormValues = z.infer<typeof formSchema>;

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "ADMIN" | "OWNER";
};

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    const result = await updateUser(user.id, {
      email: data.email,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      role: data.role,
    });

    if (result.success) {
      toast.success("Utilisateur mis à jour");
      onOpenChange(false);
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l&apos;utilisateur
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  {...form.register("firstName")}
                  disabled={isLoading}
                  placeholder="Jean"
                  className="bg-background/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  {...form.register("lastName")}
                  disabled={isLoading}
                  placeholder="Dupont"
                  className="bg-background/50 border-border focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                {...form.register("email")}
                disabled={isLoading}
                type="email"
                placeholder="utilisateur@exemple.com"
                className="bg-background/50 border-border focus:border-primary/50"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(value: "ADMIN" | "OWNER") => form.setValue("role", value)}
                disabled={isLoading}
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
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-border hover:bg-muted/50"
            >
              Annuler
            </Button>
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
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
