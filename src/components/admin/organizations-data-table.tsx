"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Trash2, Loader2, Search, Building2, Eye } from "lucide-react";
import { toast } from "sonner";
import { type OrganizationRow } from "@/app/(admin)/admin/queries";
import { deleteOrganization } from "@/app/(admin)/admin/actions";

type Owner = { id: string; email: string };

interface OrganizationsDataTableProps {
  organizations: OrganizationRow[];
  owners: Owner[];
}

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function getStatusBadge(status: string) {
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
}

export function OrganizationsDataTable({
  organizations,
  owners: _owners,
}: Readonly<OrganizationsDataTableProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const urlSearch = searchParams.get("search") || "";
  const [searchValue, setSearchValue] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  const [deleteTarget, setDeleteTarget] = useState<OrganizationRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (prevUrlSearch !== urlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchValue(urlSearch);
  }

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`/admin/organizations?${params.toString()}`);
    });
  };

  const handleSearchSubmit = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`/admin/organizations?${params.toString()}`);
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteOrganization(deleteTarget.id);
      setIsDeleting(false);
      setDeleteTarget(null);
      if (result.success) toast.success("Organisation supprimée");
      else toast.error(result.error ?? "Erreur");
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Rechercher par nom..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 bg-background/50 border-border h-10"
              />
            </div>
            <Button
              type="button"
              onClick={handleSearchSubmit}
              disabled={isPending}
              className="bg-primary text-black hover:bg-primary/90 h-10 px-4"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <Select
            value={searchParams.get("status") || "all"}
            onValueChange={(value) => updateFilters("status", value)}
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
        </div>

        <div className="border border-border rounded-xl bg-card/20 overflow-hidden">
          {organizations.length === 0 ? (
            <div className="p-8 sm:p-16 text-center">
              <Building2 className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">Aucune organisation trouvée</p>
              <p className="text-xs text-muted-foreground mt-2">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium">Organisation</TableHead>
                    <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Membres</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Statut</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-center">Restaurants</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Stripe</TableHead>
                    <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Créée le</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow
                      key={org.id}
                      className="border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/organizations/${org.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{org.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col gap-0.5">
                          {org.members.length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            org.members.map((m) => (
                              <span key={m.id} className="text-sm text-muted-foreground">
                                {m.email}
                              </span>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(org.status || "active")}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm tabular-nums">{org.restaurantCount}</span>
                      </TableCell>
                      <TableCell>
                        {org.stripeSubscriptionStatus ? (
                          <Badge
                            variant={org.stripeSubscriptionStatus === "active" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {org.stripeSubscriptionStatus}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {formatDate(org.createdAt)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-muted/50" />
                            <DropdownMenuItem onClick={() => router.push(`/admin/organizations/${org.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted/50" />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(org)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
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
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;organisation ?</AlertDialogTitle>
            <AlertDialogDescription>
              L&apos;organisation <strong>{deleteTarget?.name}</strong> sera supprimée. Les{" "}
              {deleteTarget?.restaurantCount ?? 0} restaurant(s) attachés seront détachés. Action
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="border-border">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
