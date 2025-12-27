"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus, GripVertical, Loader2, Edit2, Trash2, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createCategoryV2, deleteCategory, updateCategory } from "@/features/menu/actions-v2";

interface Category {
  id: string;
  name: string;
  rank: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function CategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onRefresh,
  isRefreshing,
}: CategorySidebarProps) {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleCreateCategory() {
    if (!categoryName.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", categoryName.trim());
      formData.append("rank", categories.length.toString());

      const result = await createCategoryV2(formData);
      if (result.success) {
        toast.success("Catégorie créée");
        setCategoryDialogOpen(false);
        setCategoryName("");
        onRefresh();
      } else {
        toast.error(result.error || "Erreur lors de la création");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsCreating(false);
    }
  }

  function handleEditCategory(categoryId: string) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    setEditingCategoryId(categoryId);
    setEditCategoryName(category.name);
    setEditDialogOpen(true);
  }

  async function handleUpdateCategory() {
    if (!editingCategoryId || !editCategoryName.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", editCategoryName.trim());

      const result = await updateCategory(editingCategoryId, formData);
      if (result.success) {
        toast.success("Catégorie renommée");
        setEditDialogOpen(false);
        setEditingCategoryId(null);
        setEditCategoryName("");
        onRefresh();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    if (category.items.length > 0) {
      toast.error("Impossible de supprimer une catégorie contenant des articles");
      setDeleteDialogOpen(null);
      return;
    }

    setDeletingIds(prev => ({ ...prev, [categoryId]: true }));
    try {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        toast.success("Catégorie supprimée");
        onRefresh();
        if (selectedCategoryId === categoryId) {
          const remainingCategories = categories.filter(c => c.id !== categoryId);
          if (remainingCategories.length > 0) {
            onSelectCategory(remainingCategories[0].id);
          } else {
            onSelectCategory("");
          }
        }
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setDeletingIds(prev => ({ ...prev, [categoryId]: false }));
      setDeleteDialogOpen(null);
    }
  }

  return (
    <div className="w-64 border-r border-border bg-card/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Catégories
        </h2>
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="w-full bg-primary text-black hover:bg-primary/90"
              onClick={() => setCategoryName("")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle catégorie
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card/95 backdrop-blur-xl border-border">
            <DialogHeader>
              <DialogTitle>Nouvelle catégorie</DialogTitle>
              <DialogDescription>
                Créez une nouvelle catégorie pour organiser vos articles
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Nom de la catégorie</Label>
                <Input
                  id="category-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Wok, Boissons..."
                  className="bg-background/50 border-border"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateCategory();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryDialogOpen(false)}
                disabled={isCreating}
                className="border-border"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={isCreating || !categoryName.trim()}
                className="bg-primary text-black hover:bg-primary/90"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des catégories */}
      <div className="flex-1 overflow-y-auto p-2">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <p>Aucune catégorie</p>
            <p className="text-xs mt-1">Créez-en une pour commencer</p>
          </div>
        ) : (
          <div className="space-y-1">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                className={`w-full rounded-lg transition-all relative group flex items-center gap-2 ${
                  selectedCategoryId === category.id
                    ? "bg-primary/20"
                    : ""
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => onSelectCategory(category.id)}
                  className={`flex-1 text-left px-3 py-2.5 rounded-lg transition-all ${
                    selectedCategoryId === category.id
                      ? "text-primary font-medium"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {category.items.length}
                    </span>
                  </div>
                </button>
                {selectedCategoryId === category.id && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"
                    layoutId="activeCategory"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category.id);
                      }}
                      className="cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Renommer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialogOpen(category.id);
                      }}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer avec indicateur de refresh */}
      {isRefreshing && (
        <div className="p-2 border-t border-border">
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            Actualisation...
          </div>
        </div>
      )}

      {/* Dialog de modification */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle>Renommer la catégorie</DialogTitle>
            <DialogDescription>
              Modifiez le nom de la catégorie
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Nom de la catégorie</Label>
              <Input
                id="edit-category-name"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="Ex: Wok, Boissons..."
                className="bg-background/50 border-border"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUpdateCategory();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingCategoryId(null);
                setEditCategoryName("");
              }}
              disabled={isUpdating}
              className="border-border"
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdateCategory}
              disabled={isUpdating || !editCategoryName.trim()}
              className="bg-primary text-black hover:bg-primary/90"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen !== null} onOpenChange={(open) => !open && setDeleteDialogOpen(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialogOpen && (categories.find(c => c.id === deleteDialogOpen)?.items.length ?? 0) > 0
                ? "Cette catégorie contient des articles. Supprimez-les d'abord avant de supprimer la catégorie."
                : "Cette action est irréversible. La catégorie sera définitivement supprimée."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Annuler</AlertDialogCancel>
            {deleteDialogOpen && (categories.find(c => c.id === deleteDialogOpen)?.items.length ?? 0) === 0 && (
              <AlertDialogAction
                onClick={() => deleteDialogOpen && handleDeleteCategory(deleteDialogOpen)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

