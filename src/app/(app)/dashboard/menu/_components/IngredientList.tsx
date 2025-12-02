"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ShoppingCart, Edit2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  toggleIngredientAvailability,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  createIngredientCategory,
  updateIngredientCategory,
  deleteIngredientCategory,
} from "@/features/menu/actions-v2";
import { useRouter } from "next/navigation";

// Types
interface IngredientCategory {
  id: string;
  name: string;
  rank: number;
}

interface Ingredient {
  id: string;
  name: string;
  ingredientCategoryId: string;
  price: number;
  isAvailable: boolean;
  imageUrl: string | null;
  ingredientCategory: IngredientCategory;
}

interface IngredientListProps {
  ingredients: Ingredient[];
  ingredientCategories: IngredientCategory[];
}

export function IngredientList({ ingredients, ingredientCategories }: IngredientListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // États pour les modales
  const [ingredientDialogOpen, setIngredientDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [ingredientCategoryDialogOpen, setIngredientCategoryDialogOpen] = useState(false);
  const [editingIngredientCategory, setEditingIngredientCategory] = useState<IngredientCategory | null>(null);
  const [ingredientIsAvailable, setIngredientIsAvailable] = useState(true);
  const [selectedIngredientCategoryId, setSelectedIngredientCategoryId] = useState<string>("");

  // Groupe les ingrédients par catégorie
  const ingredientsByCategory = ingredients.reduce((acc, ingredient) => {
    const categoryId = ingredient.ingredientCategoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  function formatPrice(price: number): string {
    if (price === 0) return "";
    return `+${(price / 100).toFixed(2)} €`;
  }

  // Fonction helper pour rafraîchir les données
  function refreshData() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleToggleIngredient(ingredientId: string, currentState: boolean) {
    setLoadingId(`ingredient-${ingredientId}`);
    
    try {
      const result = await toggleIngredientAvailability(ingredientId, !currentState);
      
      if (result.success) {
        toast.success(
          !currentState ? "Ingrédient activé" : "Ingrédient désactivé",
          {
            description: !currentState
              ? "L'ingrédient est maintenant disponible"
              : "L'ingrédient est maintenant indisponible",
          }
        );
        refreshData();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleCreateIngredient(formData: FormData) {
    setLoadingId("create-ingredient");
    try {
      const result = await createIngredient(formData);
      if (result.success) {
        toast.success("Ingrédient créé", { description: "L'ingrédient a été ajouté avec succès" });
        setIngredientDialogOpen(false);
        setEditingIngredient(null);
        setIngredientIsAvailable(true);
        setSelectedIngredientCategoryId("");
        refreshData();
      } else {
        toast.error(result.error || "Erreur lors de la création");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleUpdateIngredient(formData: FormData) {
    if (!editingIngredient) return;
    setLoadingId(`update-ingredient-${editingIngredient.id}`);
    try {
      const result = await updateIngredient(editingIngredient.id, formData);
      if (result.success) {
        toast.success("Ingrédient mis à jour", { description: "Les modifications ont été enregistrées" });
        setIngredientDialogOpen(false);
        setEditingIngredient(null);
        refreshData();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDeleteIngredient(ingredientId: string) {
    setLoadingId(`delete-ingredient-${ingredientId}`);
    try {
      const result = await deleteIngredient(ingredientId);
      if (result.success) {
        toast.success("Ingrédient supprimé", { description: "L'ingrédient a été supprimé" });
        refreshData();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleCreateIngredientCategory(formData: FormData) {
    setLoadingId("create-ingredient-category");
    try {
      const result = await createIngredientCategory(formData);
      if (result.success) {
        toast.success("Catégorie créée", { description: "La catégorie d'ingrédients a été ajoutée" });
        setIngredientCategoryDialogOpen(false);
        setEditingIngredientCategory(null);
        refreshData();
      } else {
        toast.error(result.error || "Erreur lors de la création");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleUpdateIngredientCategory(formData: FormData) {
    if (!editingIngredientCategory) return;
    setLoadingId(`update-ingredient-category-${editingIngredientCategory.id}`);
    try {
      const result = await updateIngredientCategory(editingIngredientCategory.id, formData);
      if (result.success) {
        toast.success("Catégorie mise à jour", { description: "Les modifications ont été enregistrées" });
        setIngredientCategoryDialogOpen(false);
        setEditingIngredientCategory(null);
        refreshData();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDeleteIngredientCategory(categoryId: string) {
    setLoadingId(`delete-ingredient-category-${categoryId}`);
    try {
      const result = await deleteIngredientCategory(categoryId);
      if (result.success) {
        toast.success("Catégorie supprimée", { description: "La catégorie a été supprimée" });
        refreshData();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoadingId(null);
    }
  }

  const isLoading = (id: string) => loadingId === id || isPending;

  return (
    <Card className="bg-card/30 border-white/5">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Gestion des Ingrédients & Stock
          {isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <div className="flex items-center gap-2">
          {/* Dialog Catégorie */}
          <Dialog open={ingredientCategoryDialogOpen} onOpenChange={setIngredientCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setEditingIngredientCategory(null)}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Catégorie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  if (editingIngredientCategory) {
                    await handleUpdateIngredientCategory(formData);
                  } else {
                    await handleCreateIngredientCategory(formData);
                  }
                }}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>
                    {editingIngredientCategory ? "Modifier la catégorie" : "Nouvelle catégorie d'ingrédients"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingIngredientCategory
                      ? "Modifiez les informations de la catégorie"
                      : "Créez une nouvelle catégorie pour organiser vos ingrédients"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category-name">Nom</Label>
                    <Input
                      id="category-name"
                      name="name"
                      defaultValue={editingIngredientCategory?.name}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIngredientCategoryDialogOpen(false);
                      setEditingIngredientCategory(null);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading("create-ingredient-category") || isLoading(`update-ingredient-category-${editingIngredientCategory?.id}`)}
                  >
                    {(isLoading("create-ingredient-category") || isLoading(`update-ingredient-category-${editingIngredientCategory?.id}`)) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingIngredientCategory ? "Enregistrer" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog Ingrédient */}
          <Dialog open={ingredientDialogOpen} onOpenChange={setIngredientDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingIngredient(null);
                  setIngredientIsAvailable(true);
                  setSelectedIngredientCategoryId("");
                }}
                className="bg-[#f6cf62] text-black hover:bg-[#f6cf62]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un ingrédient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const isAvailableValue = editingIngredient 
                    ? editingIngredient.isAvailable 
                    : ingredientIsAvailable;
                  formData.set("isAvailable", isAvailableValue ? "true" : "false");
                  
                  if (!formData.get("ingredientCategoryId") && selectedIngredientCategoryId) {
                    formData.set("ingredientCategoryId", selectedIngredientCategoryId);
                  }
                  
                  if (editingIngredient) {
                    await handleUpdateIngredient(formData);
                  } else {
                    await handleCreateIngredient(formData);
                  }
                }}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>
                    {editingIngredient ? "Modifier l'ingrédient" : "Nouvel ingrédient"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingIngredient
                      ? "Modifiez les informations de l'ingrédient"
                      : "Ajoutez un nouvel ingrédient à votre menu"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ingredient-name">Nom</Label>
                    <Input
                      id="ingredient-name"
                      name="name"
                      defaultValue={editingIngredient?.name}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ingredient-category">Catégorie</Label>
                    <input
                      type="hidden"
                      name="ingredientCategoryId"
                      value={editingIngredient?.ingredientCategoryId || selectedIngredientCategoryId}
                    />
                    <Select
                      value={editingIngredient?.ingredientCategoryId || selectedIngredientCategoryId}
                      onValueChange={setSelectedIngredientCategoryId}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredientCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ingredient-price">Prix par défaut (€)</Label>
                    <Input
                      id="ingredient-price"
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingIngredient ? (editingIngredient.price / 100).toFixed(2) : "0.00"}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="ingredient-isAvailable"
                      checked={editingIngredient ? editingIngredient.isAvailable : ingredientIsAvailable}
                      onCheckedChange={(checked) => {
                        if (editingIngredient) {
                          setEditingIngredient({ ...editingIngredient, isAvailable: checked });
                        } else {
                          setIngredientIsAvailable(checked);
                        }
                      }}
                    />
                    <Label htmlFor="ingredient-isAvailable">Disponible</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIngredientDialogOpen(false);
                      setEditingIngredient(null);
                      setIngredientIsAvailable(true);
                      setSelectedIngredientCategoryId("");
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading("create-ingredient") || isLoading(`update-ingredient-${editingIngredient?.id}`)}
                  >
                    {(isLoading("create-ingredient") || isLoading(`update-ingredient-${editingIngredient?.id}`)) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingIngredient ? "Enregistrer" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {ingredientCategories.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Aucune catégorie d'ingrédients</p>
            <p className="text-sm text-muted-foreground mt-1">
              Créez une catégorie pour commencer à ajouter des ingrédients
            </p>
          </div>
        ) : (
          ingredientCategories.map((category) => {
            const categoryIngredients = ingredientsByCategory[category.id] || [];
            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-primary">{category.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      ({categoryIngredients.length} ingrédient{categoryIngredients.length > 1 ? "s" : ""})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingIngredientCategory(category);
                        setIngredientCategoryDialogOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteIngredientCategory(category.id)}
                      disabled={isLoading(`delete-ingredient-category-${category.id}`)}
                      className="text-destructive hover:text-destructive"
                    >
                      {isLoading(`delete-ingredient-category-${category.id}`) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {categoryIngredients.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Aucun ingrédient dans cette catégorie
                    </p>
                  ) : (
                    categoryIngredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                          !ingredient.isAvailable
                            ? "opacity-50 bg-destructive/5 border-destructive/20"
                            : "bg-background/50 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-base">{ingredient.name}</span>
                        </div>

                        <div className="flex items-center gap-2 min-w-[100px]">
                          {ingredient.price > 0 && (
                            <span className="text-sm font-medium text-[#f6cf62]">
                              {formatPrice(ingredient.price)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingIngredient(ingredient);
                              setIngredientDialogOpen(true);
                            }}
                            className="h-8"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteIngredient(ingredient.id)}
                            disabled={isLoading(`delete-ingredient-${ingredient.id}`)}
                            className="h-8 text-destructive hover:text-destructive"
                          >
                            {isLoading(`delete-ingredient-${ingredient.id}`) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center gap-3 min-w-[140px] justify-end">
                          {isLoading(`ingredient-${ingredient.id}`) ? (
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              <Switch
                                checked={ingredient.isAvailable}
                                onCheckedChange={() =>
                                  handleToggleIngredient(ingredient.id, ingredient.isAvailable)
                                }
                                className="scale-110"
                              />
                              <span className={`text-sm font-medium ${
                                ingredient.isAvailable ? "text-[#f6cf62]" : "text-muted-foreground"
                              }`}>
                                {ingredient.isAvailable ? "Disponible" : "Épuisé"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
