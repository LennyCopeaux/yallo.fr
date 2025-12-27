"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  createIngredientCategory,
  updateIngredientCategory,
  deleteIngredientCategory,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  toggleIngredientAvailability,
} from "@/features/menu/actions-v2";

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
}

interface IngredientsTabProps {
  ingredientCategories: IngredientCategory[];
  ingredients: Ingredient[];
  onRefresh: () => void;
}

export function IngredientsTab({
  ingredientCategories: initialCategories,
  ingredients: initialIngredients,
  onRefresh,
}: IngredientsTabProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [ingredients, setIngredients] = useState(initialIngredients);

  useEffect(() => {
    setCategories(initialCategories);
    setIngredients(initialIngredients);
  }, [initialCategories, initialIngredients]);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState<string | null>(null);

  const [ingredientDialogOpen, setIngredientDialogOpen] = useState(false);
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientPrice, setIngredientPrice] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);
  const [isCreatingIngredient, setIsCreatingIngredient] = useState(false);
  const [deleteIngredientDialogOpen, setDeleteIngredientDialogOpen] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});
  const [ingredientIsAvailable, setIngredientIsAvailable] = useState(true);

  async function handleCreateCategory() {
    if (!categoryName.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    setIsCreatingCategory(true);
    try {
      const formData = new FormData();
      formData.append("name", categoryName.trim());

      const result = await createIngredientCategory(formData);
      if (result.success) {
        toast.success("Catégorie créée");
        setCategoryDialogOpen(false);
        setCategoryName("");
        onRefresh();
      } else {
        toast.error(result.error || "Erreur lors de la création");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsCreatingCategory(false);
    }
  }

  async function handleUpdateCategory() {
    if (!editingCategoryId || !categoryName.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    setIsCreatingCategory(true);
    try {
      const formData = new FormData();
      formData.append("name", categoryName.trim());

      const result = await updateIngredientCategory(editingCategoryId, formData);
      if (result.success) {
        toast.success("Catégorie mise à jour");
        setCategoryDialogOpen(false);
        setEditingCategoryId(null);
        setCategoryName("");
        onRefresh();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsCreatingCategory(false);
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    const categoryIngredients = ingredients.filter(ing => ing.ingredientCategoryId === categoryId);
    if (categoryIngredients.length > 0) {
      toast.error("Impossible de supprimer une catégorie contenant des ingrédients");
      setDeleteCategoryDialogOpen(null);
      return;
    }

    try {
      const result = await deleteIngredientCategory(categoryId);
      if (result.success) {
        toast.success("Catégorie supprimée");
        setDeleteCategoryDialogOpen(null);
        onRefresh();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch {
      toast.error("Une erreur est survenue");
    }
  }

  function openCategoryDialog(categoryId?: string) {
    if (categoryId) {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        setEditingCategoryId(categoryId);
        setCategoryName(category.name);
      }
    } else {
      setEditingCategoryId(null);
      setCategoryName("");
    }
    setCategoryDialogOpen(true);
  }

  async function handleCreateIngredient() {
    if (!ingredientName.trim() || !selectedCategoryId) {
      toast.error("Le nom et la catégorie sont requis");
      return;
    }

    const priceValue = parseFloat(ingredientPrice.replace(",", ".")) || 0;

    setIsCreatingIngredient(true);
    try {
      const formData = new FormData();
      formData.append("name", ingredientName.trim());
      formData.append("ingredientCategoryId", selectedCategoryId);
      formData.append("price", priceValue.toString());
      formData.append("isAvailable", "true");

      const result = await createIngredient(formData);
      if (result.success) {
        toast.success("Ingrédient créé");
        setIngredientDialogOpen(false);
        setIngredientName("");
        setIngredientPrice("");
        setSelectedCategoryId("");
        setIngredientIsAvailable(true);
        onRefresh();
      } else {
        toast.error(result.error || "Erreur lors de la création");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsCreatingIngredient(false);
    }
  }

  async function handleUpdateIngredient() {
    if (!editingIngredientId || !ingredientName.trim() || !selectedCategoryId) {
      toast.error("Le nom et la catégorie sont requis");
      return;
    }

    const priceValue = parseFloat(ingredientPrice.replace(",", ".")) || 0;
    const currentIngredient = ingredients.find(ing => ing.id === editingIngredientId);

    setIsCreatingIngredient(true);
    try {
      const formData = new FormData();
      formData.append("name", ingredientName.trim());
      formData.append("ingredientCategoryId", selectedCategoryId);
      formData.append("price", priceValue.toString());
      if (currentIngredient) {
        formData.append("isAvailable", currentIngredient.isAvailable.toString());
      }

      const result = await updateIngredient(editingIngredientId, formData);
      if (result.success) {
        toast.success("Ingrédient mis à jour");
        setIngredientDialogOpen(false);
        setEditingIngredientId(null);
        setIngredientName("");
        setIngredientPrice("");
        setSelectedCategoryId("");
        setIngredientIsAvailable(true);
        onRefresh();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsCreatingIngredient(false);
    }
  }

  async function handleDeleteIngredient(ingredientId: string) {
    try {
      const result = await deleteIngredient(ingredientId);
      if (result.success) {
        toast.success("Ingrédient supprimé");
        setDeleteIngredientDialogOpen(null);
        onRefresh();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch {
      toast.error("Une erreur est survenue");
    }
  }

  async function handleToggleAvailability(ingredientId: string, currentValue: boolean) {
    const newValue = !currentValue;
    setTogglingIds(prev => ({ ...prev, [ingredientId]: true }));
    setIngredients(prev => prev.map(ing => 
      ing.id === ingredientId ? { ...ing, isAvailable: newValue } : ing
    ));
    try {
      const result = await toggleIngredientAvailability(ingredientId, newValue);
      if (result.success) {
        toast.success(newValue ? "Ingrédient activé" : "Ingrédient désactivé");
      } else {
        setIngredients(prev => prev.map(ing => 
          ing.id === ingredientId ? { ...ing, isAvailable: currentValue } : ing
        ));
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch {
      setIngredients(prev => prev.map(ing => 
        ing.id === ingredientId ? { ...ing, isAvailable: currentValue } : ing
      ));
      toast.error("Une erreur est survenue");
    } finally {
      setTogglingIds(prev => ({ ...prev, [ingredientId]: false }));
    }
  }

  function openIngredientDialog(ingredientId?: string, defaultCategoryId?: string) {
    if (ingredientId) {
      const ingredient = ingredients.find(ing => ing.id === ingredientId);
      if (ingredient) {
        setEditingIngredientId(ingredientId);
        setIngredientName(ingredient.name);
        setIngredientPrice((ingredient.price / 100).toFixed(2));
        setSelectedCategoryId(ingredient.ingredientCategoryId);
        setIngredientIsAvailable(ingredient.isAvailable);
      }
    } else {
      setEditingIngredientId(null);
      setIngredientName("");
      setIngredientPrice("");
      setSelectedCategoryId(defaultCategoryId || categories[0]?.id || "");
      setIngredientIsAvailable(true);
    }
    setIngredientDialogOpen(true);
  }

  function formatPrice(priceInCents: number): string {
    if (priceInCents === 0) return "";
    return (priceInCents / 100).toFixed(2).replace(".", ",") + "€";
  }

  const ingredientsByCategory = categories.reduce((acc, category) => {
    acc[category.id] = ingredients.filter(ing => ing.ingredientCategoryId === category.id);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Ingrédients & Options</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez votre bibliothèque d'ingrédients et de catégories d'options
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Catégories d'options</h3>
          <Button
            size="sm"
            onClick={() => openCategoryDialog()}
            className="bg-primary text-black hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle catégorie
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">

        {categories.length === 0 ? (
          <Card className="bg-card/30 border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">Aucune catégorie d'options</p>
              <Button onClick={() => openCategoryDialog()} variant="outline" className="border-border">
                <Plus className="w-4 h-4 mr-2" />
                Créer une catégorie
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const categoryIngredients = ingredientsByCategory[category.id] || [];
              return (
                <Card key={category.id} className="bg-card/50 border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openCategoryDialog(category.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteCategoryDialogOpen(category.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {categoryIngredients.length} {categoryIngredients.length === 1 ? "ingrédient" : "ingrédients"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {categoryIngredients.length > 0 ? (
                      <ul className="space-y-2">
                        {categoryIngredients.map((ingredient) => (
                          <li
                            key={ingredient.id}
                            className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/30 border border-border/50"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Switch
                                checked={ingredient.isAvailable}
                                onCheckedChange={() => handleToggleAvailability(ingredient.id, ingredient.isAvailable)}
                                disabled={togglingIds[ingredient.id]}
                                className="shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm truncate ${
                                    !ingredient.isAvailable
                                      ? "text-muted-foreground line-through opacity-60"
                                      : "text-foreground"
                                  }`}
                                  title={ingredient.name}
                                >
                                  {ingredient.name}
                                </p>
                                {ingredient.price > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    {formatPrice(ingredient.price)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openIngredientDialog(ingredient.id)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteIngredientDialogOpen(ingredient.id)}
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucun ingrédient dans cette catégorie
                      </p>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openIngredientDialog(undefined, category.id)}
                      className="w-full border-border"
                    >
                      <Plus className="w-3 h-3 mr-2" />
                      Ajouter un ingrédient
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle>
              {editingCategoryId ? "Modifier la catégorie" : "Nouvelle catégorie d'options"}
            </DialogTitle>
            <DialogDescription>
              {editingCategoryId
                ? "Modifiez le nom de la catégorie"
                : "Créez une nouvelle catégorie pour organiser vos ingrédients"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nom de la catégorie</Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex: Sauces, Viandes..."
                className="bg-background/50 border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCategoryDialogOpen(false);
                setEditingCategoryId(null);
                setCategoryName("");
              }}
              disabled={isCreatingCategory}
              className="border-border"
            >
              Annuler
            </Button>
            <Button
              onClick={editingCategoryId ? handleUpdateCategory : handleCreateCategory}
              disabled={isCreatingCategory || !categoryName.trim()}
              className="bg-primary text-black hover:bg-primary/90"
            >
              {isCreatingCategory ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingCategoryId ? "Enregistrement..." : "Création..."}
                </>
              ) : (
                editingCategoryId ? "Enregistrer" : "Créer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={ingredientDialogOpen} onOpenChange={setIngredientDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle>
              {editingIngredientId ? "Modifier l'ingrédient" : "Nouvel ingrédient"}
            </DialogTitle>
            <DialogDescription>
              {editingIngredientId
                ? "Modifiez les détails de l'ingrédient"
                : "Ajoutez un nouvel ingrédient à votre bibliothèque"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ingredient-name">Nom de l'ingrédient *</Label>
              <Input
                id="ingredient-name"
                value={ingredientName}
                onChange={(e) => setIngredientName(e.target.value)}
                placeholder="Ex: Sauce blanche, Poulet..."
                className="bg-background/50 border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ingredient-category">Catégorie *</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger className="bg-background/50 border-border">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ingredient-price">Prix (€) *</Label>
                <Input
                  id="ingredient-price"
                  type="number"
                  step="0.01"
                  value={ingredientPrice}
                  onChange={(e) => setIngredientPrice(e.target.value)}
                  placeholder="0.00"
                  className="bg-background/50 border-border"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIngredientDialogOpen(false);
                setEditingIngredientId(null);
                setIngredientName("");
                setIngredientPrice("");
                setSelectedCategoryId("");
                setIngredientIsAvailable(true);
              }}
              disabled={isCreatingIngredient}
              className="border-border"
            >
              Annuler
            </Button>
            <Button
              onClick={editingIngredientId ? handleUpdateIngredient : handleCreateIngredient}
              disabled={isCreatingIngredient || !ingredientName.trim() || !selectedCategoryId}
              className="bg-primary text-black hover:bg-primary/90"
            >
              {isCreatingIngredient ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingIngredientId ? "Enregistrement..." : "Création..."}
                </>
              ) : (
                editingIngredientId ? "Enregistrer" : "Créer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteCategoryDialogOpen !== null} onOpenChange={(open) => !open && setDeleteCategoryDialogOpen(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCategoryDialogOpen && ingredientsByCategory[deleteCategoryDialogOpen]?.length > 0
                ? "Cette catégorie contient des ingrédients. Supprimez-les d'abord avant de supprimer la catégorie."
                : "Cette action est irréversible. La catégorie sera définitivement supprimée."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Annuler</AlertDialogCancel>
            {deleteCategoryDialogOpen && ingredientsByCategory[deleteCategoryDialogOpen]?.length === 0 && (
              <AlertDialogAction
                onClick={() => deleteCategoryDialogOpen && handleDeleteCategory(deleteCategoryDialogOpen)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteIngredientDialogOpen !== null} onOpenChange={(open) => !open && setDeleteIngredientDialogOpen(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'ingrédient ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'ingrédient sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Annuler</AlertDialogCancel>
            {deleteIngredientDialogOpen && (
              <AlertDialogAction
                onClick={() => deleteIngredientDialogOpen && handleDeleteIngredient(deleteIngredientDialogOpen)}
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
