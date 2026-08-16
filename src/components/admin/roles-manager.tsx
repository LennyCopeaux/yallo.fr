"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createRole, updateRole, deleteRole } from "@/app/(admin)/admin/roles/actions";
import type { SelectRole } from "@/db/schema";

const SYSTEM_ROLES = ["ADMIN", "OWNER", "EMPLOYEE"];

type RoleFormState = {
  name: string;
  description: string;
};

const defaultForm: RoleFormState = { name: "", description: "" };

export function RolesManager({ initialRoles }: { initialRoles: SelectRole[] }) {
  const [roles, setRoles] = useState<SelectRole[]>(initialRoles);
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SelectRole | null>(null);
  const [form, setForm] = useState<RoleFormState>(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState<SelectRole | null>(null);

  function openCreate() {
    setEditingRole(null);
    setForm(defaultForm);
    setDialogOpen(true);
  }

  function openEdit(role: SelectRole) {
    setEditingRole(role);
    setForm({ name: role.name, description: role.description ?? "" });
    setDialogOpen(true);
  }

  function handleSave() {
    startTransition(async () => {
      const payload = { name: form.name, description: form.description || null };
      const result = editingRole
        ? await updateRole(editingRole.id, payload)
        : await createRole(payload);

      if (!result.success) {
        toast.error(result.error ?? "Une erreur est survenue");
        return;
      }

      toast.success(editingRole ? "Rôle mis à jour" : "Rôle créé");
      setDialogOpen(false);

      if (editingRole) {
        setRoles((prev) =>
          prev.map((r) => (r.id === editingRole.id ? { ...r, ...payload } : r))
        );
      } else {
        window.location.reload();
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteRole(deleteTarget.id);
      if (!result.success) {
        toast.error(result.error ?? "Une erreur est survenue");
        setDeleteTarget(null);
        return;
      }
      toast.success("Rôle supprimé");
      setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  }

  return (
    <div className="space-y-4">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Rôles</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les rôles disponibles pour les membres de vos organisations et restaurants.
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <span className="text-lg leading-none">+</span>
          Créer un rôle
        </Button>
      </div>

      {}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-12 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                  Aucun rôle défini.
                </TableCell>
              </TableRow>
            )}
            {roles.map((role) => {
              const isSystem = SYSTEM_ROLES.includes(role.name);
              return (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm truncate max-w-0">
                    {role.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <MoreHorizontal className="w-4 h-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem
                          disabled={isSystem}
                          onClick={() => !isSystem && openEdit(role)}
                          className={isSystem ? "opacity-40 cursor-not-allowed" : ""}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifier
                          {isSystem && <span className="ml-auto text-xs text-muted-foreground">Système</span>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={isSystem || isPending}
                          onClick={() => !isSystem && setDeleteTarget(role)}
                          className={isSystem ? "opacity-40 cursor-not-allowed" : "text-destructive focus:text-destructive"}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                          {isSystem && <span className="ml-auto text-xs text-muted-foreground">Système</span>}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Modifier le rôle" : "Créer un rôle"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="role-name">Nom</Label>
              <Input
                id="role-name"
                placeholder="ex. Gérant, Caissier…"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                placeholder="Décrivez les droits et responsabilités de ce rôle…"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isPending || !form.name.trim()}>
              {isPending ? "Enregistrement…" : editingRole ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le rôle « {deleteTarget?.name} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les membres ayant ce rôle ne seront pas supprimés,
              mais leur rôle ne sera plus valide.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
