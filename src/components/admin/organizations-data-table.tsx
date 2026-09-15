"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import {
  AdminStatusBadge,
  stripeStatusLabel,
  stripeStatusTone,
} from "@/components/admin/status-badge";
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
      return <AdminStatusBadge tone="active" label="Actif" />;
    case "onboarding":
      return <AdminStatusBadge tone="warning" label="Onboarding" />;
    case "suspended":
      return <AdminStatusBadge tone="danger" label="Suspendu" />;
    default:
      return <AdminStatusBadge label={status} />;
  }
}

export function OrganizationsDataTable({
  organizations,
  owners: _owners,
}: Readonly<OrganizationsDataTableProps>) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<OrganizationRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    for (const org of organizations) {
      router.prefetch(`/admin/organizations/${org.id}`);
    }
  }, [organizations, router]);

  const filteredOrganizations = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    return organizations.filter((org) => {
      const matchesSearch = !term || org.name.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || org.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [organizations, searchValue, statusFilter]);

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
        </div>

        <div className="border border-border rounded-xl bg-card/20 overflow-hidden">
          {filteredOrganizations.length === 0 ? (
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
                  {filteredOrganizations.map((org) => (
                    <TableRow
                      key={org.id}
                      className="relative border-border hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <Link
                          href={`/admin/organizations/${org.id}`}
                          prefetch
                          className="flex items-center gap-2 after:absolute after:inset-0 after:content-['']"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{org.name}</span>
                        </Link>
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
                          <AdminStatusBadge
                            tone={stripeStatusTone(org.stripeSubscriptionStatus)}
                            label={stripeStatusLabel(org.stripeSubscriptionStatus)}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {formatDate(org.createdAt)}
                      </TableCell>
                      <TableCell className="relative z-10">
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
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/organizations/${org.id}`} prefetch>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir détails
                              </Link>
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
