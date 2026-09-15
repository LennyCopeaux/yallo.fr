"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { MoreHorizontal, Search, Eye, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteRestaurant } from "@/app/(admin)/admin/restaurants/actions";
import { AdminStatusBadge } from "@/components/admin/status-badge";

type Restaurant = {
  id: string;
  name: string;
  address: string | null;
  phoneNumber: string;
  ownerId: string;
  status: "active" | "suspended" | "onboarding";
  isActive: boolean | null;
  vapiAssistantId: string | null;
  twilioPhoneNumber: string | null;
  createdAt: Date | null;
  ownerEmail: string;
  owners: string[];
  ordersCount: number;
};

interface RestaurantsDataTableProps {
  data: Restaurant[];
}

export function RestaurantsDataTable({ data }: Readonly<RestaurantsDataTableProps>) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [aiFilter, setAiFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    for (const restaurant of data) {
      router.prefetch(`/admin/restaurants/${restaurant.id}`);
    }
  }, [data, router]);

  const filteredData = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    return data.filter((restaurant) => {
      const matchesSearch =
        !term ||
        restaurant.name.toLowerCase().includes(term) ||
        restaurant.ownerEmail.toLowerCase().includes(term) ||
        restaurant.owners.some((email) => email.toLowerCase().includes(term));
      const matchesStatus = statusFilter === "all" || restaurant.status === statusFilter;
      const matchesAi = aiFilter === "all" || (aiFilter === "true" && !!restaurant.vapiAssistantId);
      return matchesSearch && matchesStatus && matchesAi;
    });
  }, [aiFilter, data, searchValue, statusFilter]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <AdminStatusBadge tone="active" label="Actif" />;
      case "onboarding":
        return <AdminStatusBadge tone="warning" label="Onboarding" />;
      case "suspended":
        return <AdminStatusBadge tone="danger" label="Suspendu" />;
      default:
        return <AdminStatusBadge tone="neutral" label={status} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 bg-background/50 border-border h-10"
            />
          </div>
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border h-10">
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
          value={aiFilter}
          onValueChange={setAiFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border h-10">
            <SelectValue placeholder="État IA" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Toutes les IA</SelectItem>
            <SelectItem value="true">IA Configurée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-xl bg-card/20 overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="p-8 sm:p-16 text-center">
            <p className="text-muted-foreground text-sm sm:text-base">Aucun restaurant trouvé</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Essayez de modifier vos filtres ou votre recherche
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Restaurant</TableHead>
                  <TableHead className="text-muted-foreground font-medium hidden md:table-cell">
                    Membres
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">Statut</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-center">
                    Commandes
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-center">
                    IA
                  </TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((restaurant) => (
                  <TableRow
                    key={restaurant.id}
                    className="relative border-border hover:bg-primary/[0.02]"
                  >
                    <TableCell className="min-w-[150px]">
                      <div>
                        <Link
                          href={`/admin/restaurants/${restaurant.id}`}
                          prefetch
                          className="font-medium text-sm sm:text-base hover:text-primary after:absolute after:inset-0 after:content-['']"
                        >
                          {restaurant.name}
                        </Link>
                        <div className="md:hidden mt-1 flex flex-col gap-0.5">
                          {restaurant.owners.length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            restaurant.owners.map((ownerEmail) => (
                              <span key={ownerEmail} className="text-xs text-muted-foreground break-all">
                                {ownerEmail}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground min-w-[180px]">
                      <div className="flex flex-col gap-0.5">
                        {restaurant.owners.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          restaurant.owners.map((ownerEmail) => (
                            <span key={ownerEmail} className="text-sm text-muted-foreground break-all">
                              {ownerEmail}
                            </span>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      {getStatusBadge(restaurant.status)}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground min-w-[80px]">
                      {restaurant.ordersCount}
                    </TableCell>
                    <TableCell className="text-center min-w-[60px]">
                      {restaurant.vapiAssistantId ? (
                        <AdminStatusBadge tone="active" label="Actif" />
                      ) : (
                        <AdminStatusBadge tone="neutral" label="—" />
                      )}
                    </TableCell>
                    <TableCell className="relative z-10 min-w-[44px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 sm:h-8 sm:w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                          >
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
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le restaurant ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{restaurantToDelete?.name}</strong> ? Cette
              action est irréversible et supprimera toutes les données associées.
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
