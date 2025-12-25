"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  MoreHorizontal, 
  Search, 
  Eye, 
  Trash2,
  UserCheck,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { deleteRestaurant, impersonateRestaurant } from "@/app/(admin)/admin/restaurants/actions";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phoneNumber: string;
  ownerId: string;
  status: "active" | "suspended" | "onboarding";
  isActive: boolean | null;
  vapiAssistantId: string | null;
  twilioPhoneNumber: string | null;
  createdAt: Date | null;
  ownerEmail: string;
};

type Owner = {
  id: string;
  email: string;
};

interface RestaurantsDataTableProps {
  data: Restaurant[];
  owners: Owner[];
}

export function RestaurantsDataTable({ data, owners }: RestaurantsDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  // Met à jour les filtres dans l'URL
  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`/admin?tab=restaurants&${params.toString()}`);
    });
  };

  // Recherche au clic sur Entrée ou bouton
  const handleSearchSubmit = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`/admin?tab=restaurants&${params.toString()}`);
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  // Suppression
  const handleDelete = async () => {
    if (!restaurantToDelete) return;
    
    setIsDeleting(true);
    const result = await deleteRestaurant(restaurantToDelete.id);
    setIsDeleting(false);
    
    if (result.success) {
      toast.success("Restaurant supprimé");
      setDeleteDialogOpen(false);
      setRestaurantToDelete(null);
    } else {
      toast.error(result.error || "Erreur lors de la suppression");
    }
  };

  // Impersonation
  const handleImpersonate = async (restaurant: Restaurant) => {
    setImpersonatingId(restaurant.id);
    const result = await impersonateRestaurant(restaurant.id);
    
    if (result.success && result.data) {
      toast.success(`Connexion en tant que ${restaurant.name}...`);
      // Ouvre dans un nouvel onglet
      window.open(result.data, "_blank");
    } else {
      toast.error(result.error || "Erreur lors de l'impersonation");
    }
    setImpersonatingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 hover:bg-emerald-400/15">
            Actif
          </Badge>
        );
      case "onboarding":
        return (
          <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 hover:bg-amber-400/15">
            Onboarding
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-400/10 text-red-400 border-red-400/20 hover:bg-red-400/15">
            Suspendu
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };


  return (
    <div className="space-y-4">
      {/* Filtres - Toujours visibles */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10 bg-background/50 border-border"
            />
          </div>
          <Button
            type="button"
            onClick={handleSearchSubmit}
            disabled={isPending}
            className="bg-primary text-black hover:bg-primary/90"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <Select
          value={searchParams.get("status") || "all"}
          onValueChange={(value) => updateFilters("status", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="suspended">Suspendu</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={searchParams.get("hasAI") || "all"}
          onValueChange={(value) => updateFilters("hasAI", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border">
            <SelectValue placeholder="État IA" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Toutes les IA</SelectItem>
            <SelectItem value="true">IA Configurée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl bg-card/20 overflow-hidden">
        {data.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-muted-foreground">Aucun restaurant trouvé</p>
            <p className="text-sm text-muted-foreground mt-2">
              Essayez de modifier vos filtres ou votre recherche
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">Restaurant</TableHead>
                <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Propriétaire</TableHead>
                <TableHead className="text-muted-foreground font-medium">Statut</TableHead>
                <TableHead className="text-muted-foreground font-medium text-center">IA</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((restaurant) => (
              <TableRow 
                key={restaurant.id} 
                className="border-border hover:bg-primary/[0.02] cursor-pointer"
                onClick={() => router.push(`/admin/restaurants/${restaurant.id}`)}
              >
                <TableCell>
                  <div>
                    <div className="font-medium">{restaurant.name}</div>
                    <div className="text-xs text-muted-foreground">
                      /{restaurant.slug}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {restaurant.ownerEmail}
                </TableCell>
                <TableCell>
                  {getStatusBadge(restaurant.status)}
                </TableCell>
                <TableCell className="text-center">
                  <div 
                    className={`w-3 h-3 rounded-full mx-auto ${
                      restaurant.vapiAssistantId 
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' 
                        : 'bg-zinc-600'
                    }`}
                    title={restaurant.vapiAssistantId ? "IA configurée" : "IA non configurée"}
                  />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-muted/50" />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/restaurants/${restaurant.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        disabled
                        className="opacity-50 cursor-not-allowed"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        <span className="line-through">Se connecter en tant que</span>
                        <span className="ml-2 text-xs text-muted-foreground">(À venir)</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-muted/50" />
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-400"
                        onClick={() => {
                          setRestaurantToDelete(restaurant);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Loading overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le restaurant ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{restaurantToDelete?.name}</strong> ?
              Cette action est irréversible et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
