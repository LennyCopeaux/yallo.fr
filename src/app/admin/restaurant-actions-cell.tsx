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
import { updateRestaurant, deleteRestaurant } from "./actions";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2, Loader2, User } from "lucide-react";

type Restaurant = {
  id: string;
  name: string;
  phoneNumber: string;
  ownerId: string;
};

type Owner = {
  id: string;
  email: string;
};

interface RestaurantActionsCellProps {
  restaurant: Restaurant;
  owners: Owner[];
}

export function RestaurantActionsCell({ restaurant, owners }: RestaurantActionsCellProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState(restaurant.name);
  const [phoneNumber, setPhoneNumber] = useState(restaurant.phoneNumber);
  const [ownerId, setOwnerId] = useState(restaurant.ownerId);

  async function handleUpdate() {
    setIsLoading(true);
    const result = await updateRestaurant(restaurant.id, { name, phoneNumber, ownerId });
    setIsLoading(false);

    if (result.success) {
      toast.success("Restaurant modifié avec succès");
      setIsEditOpen(false);
    } else {
      toast.error(result.error || "Erreur lors de la modification");
    }
  }

  async function handleDelete() {
    setIsLoading(true);
    const result = await deleteRestaurant(restaurant.id);
    setIsLoading(false);

    if (result.success) {
      toast.success("Restaurant supprimé avec succès");
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
            <DialogTitle>Modifier le restaurant</DialogTitle>
            <DialogDescription>
              Modifiez les informations du restaurant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="bg-background/50 border-white/10 focus:border-[#f6cf62]/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
                className="bg-background/50 border-white/10 focus:border-[#f6cf62]/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-owner">Propriétaire</Label>
              <Select value={ownerId} onValueChange={setOwnerId} disabled={isLoading}>
                <SelectTrigger className="bg-background/50 border-white/10 focus:border-[#f6cf62]/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#f6cf62]" />
                        {owner.email}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              Supprimer le restaurant ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera{" "}
              <strong className="text-foreground">{restaurant.name}</strong> et toutes ses données.
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
