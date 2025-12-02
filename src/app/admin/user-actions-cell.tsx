"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUser, deleteUser } from "./actions";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";

type User = {
  id: string;
  email: string;
  role: "ADMIN" | "OWNER";
};

interface UserActionsCellProps {
  user: User;
  currentUserId: string;
}

export function UserActionsCell({ user, currentUserId }: UserActionsCellProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<"ADMIN" | "OWNER">(user.role);

  const isCurrentUser = user.id === currentUserId;

  async function handleUpdate() {
    setIsLoading(true);
    const result = await updateUser(user.id, { email, role });
    setIsLoading(false);

    if (result.success) {
      toast.success("Utilisateur modifié avec succès");
      setIsEditOpen(false);
    } else {
      toast.error(result.error || "Erreur lors de la modification");
    }
  }

  async function handleDelete() {
    setIsLoading(true);
    const result = await deleteUser(user.id);
    setIsLoading(false);

    if (result.success) {
      toast.success("Utilisateur supprimé avec succès");
      setIsDeleteOpen(false);
    } else {
      toast.error(result.error || "Erreur lors de la suppression");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card border-white/10">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="hover:bg-white/5">
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="text-destructive focus:text-destructive hover:bg-destructive/10"
            disabled={isCurrentUser}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l&apos;utilisateur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-background/50 border-white/10 focus:border-[#f6cf62]/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rôle</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as "ADMIN" | "OWNER")}
                disabled={isLoading || isCurrentUser}
              >
                <SelectTrigger className="bg-background/50 border-white/10 focus:border-[#f6cf62]/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="OWNER">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#f6cf62]" />
                      OWNER
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      ADMIN
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {isCurrentUser && (
                <p className="text-xs text-muted-foreground">
                  Vous ne pouvez pas changer votre propre rôle
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isLoading}
              className="border-white/10 hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={isLoading}
              className="bg-[#f6cf62] text-black hover:bg-[#f6cf62]/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Supprimer l&apos;utilisateur ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera{" "}
              <strong className="text-foreground">{user.email}</strong> et tous ses restaurants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading} className="border-white/10 hover:bg-white/5">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Confirmer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
