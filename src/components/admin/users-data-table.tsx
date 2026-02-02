"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { MoreHorizontal, Trash2, Loader2, AlertCircle, Mail, KeyRound, Edit, Search } from "lucide-react";
import { toast } from "sonner";
import { deleteUser, resendWelcomeEmail, sendPasswordResetEmail } from "@/app/(admin)/admin/actions";
import { EditUserDialog } from "./edit-user-dialog";

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "ADMIN" | "OWNER";
  mustChangePassword: boolean;
  createdAt: Date | null;
};

interface UsersDataTableProps {
  data: User[];
}

export function UsersDataTable({ data }: UsersDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resendingFor, setResendingFor] = useState<string | null>(null);
  const [resettingFor, setResettingFor] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`/admin?tab=users&${params.toString()}`);
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
      router.push(`/admin?tab=users&${params.toString()}`);
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const searchTerm = searchParams.get("search")?.toLowerCase() || "";
  const roleFilter = searchParams.get("role") || "all";
  
  const filteredData = data.filter((user) => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm) ||
      user.firstName?.toLowerCase().includes(searchTerm) ||
      user.lastName?.toLowerCase().includes(searchTerm);
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    const result = await deleteUser(userToDelete.id);
    setIsDeleting(false);
    
    if (result.success) {
      toast.success("Utilisateur supprimé");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } else {
      toast.error(result.error || "Erreur lors de la suppression");
    }
  };

  const handleResendEmail = async (userId: string) => {
    setResendingFor(userId);
    const result = await resendWelcomeEmail(userId);
    setResendingFor(null);
    
    if (result.success) {
      toast.success("Nouveaux identifiants envoyés par email");
    } else {
      toast.error(result.error || "Erreur lors de l'envoi");
    }
  };

  const handleSendPasswordReset = async (userId: string) => {
    setResettingFor(userId);
    const result = await sendPasswordResetEmail(userId);
    setResettingFor(null);
    
    if (result.success) {
      toast.success("Email de réinitialisation envoyé");
    } else {
      toast.error(result.error || "Erreur lors de l'envoi");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
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
            className="bg-primary text-black hover:bg-primary/90 h-10 min-h-[44px] min-w-[44px]"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <Select
          value={roleFilter}
          onValueChange={(value) => updateFilters("role", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border h-10">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="OWNER">Owner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl bg-card/20 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Utilisateur</TableHead>
              <TableHead className="text-muted-foreground font-medium">Rôle</TableHead>
              <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Statut</TableHead>
              <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">Inscription</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((user) => (
              <TableRow key={user.id} className="border-border hover:bg-primary/[0.02]">
                <TableCell className="min-w-[180px]">
                  <div>
                    <div className="font-medium text-sm sm:text-base">
                      {user.firstName || user.lastName
                        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                        : user.email}
                    </div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                    {user.mustChangePassword && (
                      <span className="flex items-center gap-1.5 text-amber-400 text-xs md:hidden mt-1">
                        <AlertCircle className="w-3 h-3" />
                        Changement MDP requis
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="min-w-[100px]">
                  <Badge
                    className={
                      user.role === "ADMIN"
                        ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15"
                        : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell min-w-[160px]">
                  {user.mustChangePassword ? (
                    <span className="flex items-center gap-1.5 text-amber-400 text-sm">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Changement MDP requis
                    </span>
                  ) : (
                    <span className="text-emerald-400 text-sm">Actif</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground hidden lg:table-cell min-w-[120px]">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </TableCell>
                <TableCell className="min-w-[44px]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-8 sm:w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-muted/50" />
                      <DropdownMenuItem
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-muted/50" />
                      {user.mustChangePassword ? (
                        <DropdownMenuItem
                          onClick={() => handleResendEmail(user.id)}
                          disabled={resendingFor === user.id}
                        >
                          {resendingFor === user.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Mail className="w-4 h-4 mr-2" />
                          )}
                          Renvoyer les identifiants
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleSendPasswordReset(user.id)}
                          disabled={resettingFor === user.id}
                        >
                          {resettingFor === user.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <KeyRound className="w-4 h-4 mr-2" />
                          )}
                          Envoyer réinitialisation MDP
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-muted/50" />
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-400"
                        onClick={() => {
                          setUserToDelete(user);
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
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Edit user dialog */}
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{userToDelete?.email}</strong> ?
              Cette action est irréversible.
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
