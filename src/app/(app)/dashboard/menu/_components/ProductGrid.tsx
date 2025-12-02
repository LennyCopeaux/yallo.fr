"use client";

import { useState, useTransition } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, Package, Edit2, Check, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  updateVariationPrice,
  createCategoryV2,
  updateCategory,
  deleteCategory,
  createVariation,
  updateVariation,
  deleteVariation,
  createModifierGroup,
  deleteModifierGroup,
  deleteModifier,
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

interface ModifierIngredient {
  id: string;
  name: string;
  ingredientCategoryId: string;
  price: number;
  isAvailable: boolean;
  imageUrl: string | null;
}

interface Modifier {
  id: string;
  ingredientId: string;
  priceExtra: number;
  ingredient: ModifierIngredient;
}

interface ModifierGroup {
  id: string;
  ingredientCategoryId: string;
  minSelect: number;
  maxSelect: number;
  modifiers: Modifier[];
  ingredientCategory: IngredientCategory;
}

interface ProductVariation {
  id: string;
  name: string;
  price: number;
  modifierGroups: ModifierGroup[];
}

interface Category {
  id: string;
  name: string;
  rank: number;
  variations: ProductVariation[];
}

interface ProductGridProps {
  categories: Category[];
  ingredients: Ingredient[];
  ingredientCategories: IngredientCategory[];
}

export function ProductGrid({ categories, ingredients, ingredientCategories }: ProductGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingVariation, setEditingVariation] = useState<string | null>(null);
  const [variationPrice, setVariationPrice] = useState<string>("");

  // États pour les modales
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [variationDialogOpen, setVariationDialogOpen] = useState(false);
  const [editingVariationData, setEditingVariationData] = useState<ProductVariation | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [modifierGroupDialogOpen, setModifierGroupDialogOpen] = useState(false);
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [variationEditDialogOpen, setVariationEditDialogOpen] = useState(false);
  const [editingVariationFull, setEditingVariationFull] = useState<ProductVariation | null>(null);

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

  const isLoading = (id: string) => loadingId === id || isPending;

  function startEditVariation(variationId: string, currentPrice: number) {
    setEditingVariation(variationId);
    setVariationPrice((currentPrice / 100).toFixed(2));
  }

  function cancelEdit() {
    setEditingVariation(null);
    setVariationPrice("");
  }

  async function handleUpdateVariationPrice(variationId: string) {
    const newPrice = Math.round(parseFloat(variationPrice) * 100);
    
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error("Prix invalide");
      return;
    }

    setLoadingId(`variation-${variationId}`);
    
    try {
      const result = await updateVariationPrice(variationId, newPrice);
      
      if (result.success) {
        toast.success("Prix mis à jour", {
          description: `Le prix est maintenant ${(newPrice / 100).toFixed(2)} €`,
        });
        setEditingVariation(null);
        setVariationPrice("");
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

  async function handleCreateCategory(formData: FormData) {
    setLoadingId("create-category");
    try {
      const result = await createCategoryV2(formData);
      if (result.success) {
        toast.success("Catégorie créée", { description: "La catégorie a été ajoutée avec succès" });
        setCategoryDialogOpen(false);
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

  async function handleUpdateCategory(formData: FormData) {
    if (!editingCategory) return;
    setLoadingId(`update-category-${editingCategory.id}`);
    try {
      const result = await updateCategory(editingCategory.id, formData);
      if (result.success) {
        toast.success("Catégorie mise à jour", { description: "Les modifications ont été enregistrées" });
        setCategoryDialogOpen(false);
        setEditingCategory(null);
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

  async function handleDeleteCategory(categoryId: string) {
    setLoadingId(`delete-category-${categoryId}`);
    try {
      const result = await deleteCategory(categoryId);
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

  async function handleCreateVariation(formData: FormData) {
    setLoadingId("create-variation");
    try {
      const result = await createVariation(formData);
      if (result.success) {
        toast.success("Variation créée", { description: "La variation a été ajoutée avec succès" });
        setVariationDialogOpen(false);
        setSelectedCategoryId(null);
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

  async function handleUpdateVariation(formData: FormData) {
    if (!editingVariationData) return;
    setLoadingId(`update-variation-${editingVariationData.id}`);
    try {
      const result = await updateVariation(editingVariationData.id, formData);
      if (result.success) {
        toast.success("Variation mise à jour", { description: "Les modifications ont été enregistrées" });
        setVariationDialogOpen(false);
        setEditingVariationData(null);
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

  async function handleDeleteVariation(variationId: string) {
    setLoadingId(`delete-variation-${variationId}`);
    try {
      const result = await deleteVariation(variationId);
      if (result.success) {
        toast.success("Variation supprimée", { description: "La variation a été supprimée" });
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

  async function handleCreateModifierGroup(formData: FormData) {
    setLoadingId("create-modifier-group");
    try {
      const result = await createModifierGroup(formData);
      if (result.success) {
        toast.success("Catégorie ajoutée", { description: "La catégorie d'ingrédients a été ajoutée au produit" });
        setModifierGroupDialogOpen(false);
        setSelectedVariationId(null);
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

  async function handleDeleteModifierGroup(groupId: string) {
    setLoadingId(`delete-modifier-group-${groupId}`);
    try {
      const result = await deleteModifierGroup(groupId);
      if (result.success) {
        toast.success("Catégorie supprimée", { description: "La catégorie a été retirée du produit" });
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

  async function handleDeleteModifier(modifierId: string) {
    setLoadingId(`delete-modifier-${modifierId}`);
    try {
      const result = await deleteModifier(modifierId);
      if (result.success) {
        toast.success("Ingrédient retiré", { description: "L'ingrédient a été retiré du groupe" });
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

  async function handleUpdateVariationFull(formData: FormData) {
    if (!editingVariationFull) return;
    const price = Math.round(parseFloat(formData.get("price") as string) * 100);
    const updateFormData = new FormData();
    updateFormData.append("name", editingVariationFull.name);
    updateFormData.append("price", price.toString());
    
    setLoadingId(`update-variation-${editingVariationFull.id}`);
    try {
      const result = await updateVariation(editingVariationFull.id, updateFormData);
      if (result.success) {
        toast.success("Variation mise à jour");
        setVariationEditDialogOpen(false);
        setEditingVariationFull(null);
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

  if (categories.length === 0) {
    return (
      <Card className="bg-card/30 border-white/5">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground mb-4">Aucune catégorie de produits</p>
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCategory(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer une catégorie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleCreateCategory(new FormData(e.currentTarget));
                }}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>Nouvelle catégorie</DialogTitle>
                </DialogHeader>
                <div>
                  <Label htmlFor="category-name">Nom</Label>
                  <Input id="category-name" name="name" required className="mt-1" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setCategoryDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading("create-category")}>
                    {isLoading("create-category") && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Créer
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Tabs defaultValue={categories[0]?.id} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TabsList className="bg-card/30 border-white/5 p-1">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-[#f6cf62]/10 data-[state=active]:text-[#f6cf62]"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCategory(null)} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Catégorie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  if (editingCategory) {
                    await handleUpdateCategory(formData);
                  } else {
                    await handleCreateCategory(formData);
                  }
                }}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
                  </DialogTitle>
                </DialogHeader>
                <div>
                  <Label htmlFor="category-name">Nom</Label>
                  <Input
                    id="category-name"
                    name="name"
                    defaultValue={editingCategory?.name}
                    required
                    className="mt-1"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setCategoryDialogOpen(false);
                      setEditingCategory(null);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading("create-category") || isLoading(`update-category-${editingCategory?.id}`)}
                  >
                    {(isLoading("create-category") || isLoading(`update-category-${editingCategory?.id}`)) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingCategory ? "Enregistrer" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingCategory(category);
                    setCategoryDialogOpen(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={isLoading(`delete-category-${category.id}`)}
                  className="text-destructive hover:text-destructive"
                >
                  {isLoading(`delete-category-${category.id}`) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Dialog open={variationDialogOpen && selectedCategoryId === category.id} onOpenChange={(open) => {
                setVariationDialogOpen(open);
                if (!open) setSelectedCategoryId(null);
              }}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setEditingVariationData(null);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une variation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      if (editingVariationData) {
                        await handleUpdateVariation(formData);
                      } else {
                        await handleCreateVariation(formData);
                      }
                    }}
                    className="space-y-4"
                  >
                    <DialogHeader>
                      <DialogTitle>
                        {editingVariationData ? "Modifier la variation" : "Nouvelle variation"}
                      </DialogTitle>
                    </DialogHeader>
                    {!editingVariationData && (
                      <input type="hidden" name="categoryId" value={selectedCategoryId || ""} />
                    )}
                    <div>
                      <Label htmlFor="variation-name">Nom</Label>
                      <Input
                        id="variation-name"
                        name="name"
                        defaultValue={editingVariationData?.name}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="variation-price">Prix (€)</Label>
                      <Input
                        id="variation-price"
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={editingVariationData ? (editingVariationData.price / 100).toFixed(2) : "0.00"}
                        required
                        className="mt-1"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setVariationDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading("create-variation") || isLoading(`update-variation-${editingVariationData?.id}`)}
                      >
                        {(isLoading("create-variation") || isLoading(`update-variation-${editingVariationData?.id}`)) && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {editingVariationData ? "Enregistrer" : "Créer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {category.variations.length === 0 ? (
              <Card className="bg-card/30 border-white/5">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">Aucune variation dans cette catégorie</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {category.variations.map((variation) => (
                  <Card key={variation.id} className="bg-card/20 border-white/5">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{variation.name}</h4>
                          {editingVariation === variation.id ? (
                            <div className="flex items-center gap-2 mt-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={variationPrice}
                                onChange={(e) => setVariationPrice(e.target.value)}
                                className="w-24 h-8"
                                placeholder="0.00"
                              />
                              <span className="text-sm text-muted-foreground">€</span>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateVariationPrice(variation.id)}
                                disabled={isLoading(`variation-${variation.id}`)}
                                className="h-8"
                              >
                                {isLoading(`variation-${variation.id}`) ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8">
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-2xl font-bold text-[#f6cf62]">
                                {(variation.price / 100).toFixed(2)} €
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditVariation(variation.id, variation.price)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingVariationFull(variation);
                              setVariationEditDialogOpen(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteVariation(variation.id)}
                            disabled={isLoading(`delete-variation-${variation.id}`)}
                            className="text-destructive hover:text-destructive"
                          >
                            {isLoading(`delete-variation-${variation.id}`) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Groupes de modificateurs */}
                      {variation.modifierGroups.length > 0 && (
                        <div className="space-y-3 pt-2 border-t border-white/5">
                          {variation.modifierGroups.map((group) => (
                            <div key={group.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {group.ingredientCategory.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ({group.minSelect === group.maxSelect
                                      ? `${group.minSelect} choix`
                                      : `${group.minSelect}-${group.maxSelect} choix`})
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteModifierGroup(group.id)}
                                  disabled={isLoading(`delete-modifier-group-${group.id}`)}
                                  className="text-destructive"
                                >
                                  {isLoading(`delete-modifier-group-${group.id}`) ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {group.modifiers.map((modifier) => {
                                  const ingredient = ingredients.find((ing) => ing.id === modifier.ingredientId);
                                  if (!ingredient) return null;

                                  return (
                                    <div
                                      key={modifier.id}
                                      className={`flex items-center justify-between p-2 rounded text-sm ${
                                        !ingredient.isAvailable
                                          ? "opacity-50 bg-destructive/10"
                                          : "bg-background/30"
                                      }`}
                                    >
                                      <span>{ingredient.name}</span>
                                      <div className="flex items-center gap-2">
                                        {modifier.priceExtra > 0 && (
                                          <span className="text-[#f6cf62] font-medium">
                                            {formatPrice(modifier.priceExtra)}
                                          </span>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDeleteModifier(modifier.id)}
                                          disabled={isLoading(`delete-modifier-${modifier.id}`)}
                                          className="h-4 w-4 p-0 text-destructive"
                                        >
                                          {isLoading(`delete-modifier-${modifier.id}`) ? (
                                            <Loader2 className="w-2 h-2 animate-spin" />
                                          ) : (
                                            <X className="w-2 h-2" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Bouton pour ajouter une catégorie d'ingrédients */}
                      <div className="pt-2 border-t border-white/5">
                        <Dialog
                          open={modifierGroupDialogOpen && selectedVariationId === variation.id}
                          onOpenChange={(open) => {
                            setModifierGroupDialogOpen(open);
                            if (!open) setSelectedVariationId(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedVariationId(variation.id)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Ajouter une catégorie d'ingrédients
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                await handleCreateModifierGroup(new FormData(e.currentTarget));
                              }}
                              className="space-y-4"
                            >
                              <DialogHeader>
                                <DialogTitle>Ajouter une catégorie d'ingrédients</DialogTitle>
                                <DialogDescription>
                                  Sélectionnez une catégorie d'ingrédients à ajouter à cette variation
                                </DialogDescription>
                              </DialogHeader>
                              <input type="hidden" name="variationId" value={selectedVariationId || ""} />
                              <div>
                                <Label htmlFor="modifier-group-category">Catégorie d'ingrédients</Label>
                                <Select name="ingredientCategoryId" required>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Sélectionnez une catégorie" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ingredientCategories
                                      .filter(
                                        (cat) =>
                                          !variation.modifierGroups.some(
                                            (g) => g.ingredientCategoryId === cat.id
                                          )
                                      )
                                      .map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                          {cat.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="min-select">Sélection minimum</Label>
                                  <Input
                                    id="min-select"
                                    name="minSelect"
                                    type="number"
                                    defaultValue="0"
                                    min="0"
                                    required
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="max-select">Sélection maximum</Label>
                                  <Input
                                    id="max-select"
                                    name="maxSelect"
                                    type="number"
                                    defaultValue="1"
                                    min="1"
                                    required
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setModifierGroupDialogOpen(false)}>
                                  Annuler
                                </Button>
                                <Button type="submit" disabled={isLoading("create-modifier-group")}>
                                  {isLoading("create-modifier-group") && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  )}
                                  Ajouter
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Modale d'édition complète de variation */}
      <Dialog open={variationEditDialogOpen} onOpenChange={setVariationEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editingVariationFull && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleUpdateVariationFull(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle>Modifier "{editingVariationFull.name}"</DialogTitle>
                <DialogDescription>
                  Gérez le prix, les ingrédients et les catégories de cette variation
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-variation-price">Prix (€)</Label>
                  <Input
                    id="edit-variation-price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={(editingVariationFull.price / 100).toFixed(2)}
                    required
                    className="mt-1"
                  />
                </div>

                {editingVariationFull.modifierGroups.map((group) => (
                  <Card key={group.id} className="bg-card/20 border-white/5">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{group.ingredientCategory.name}</CardTitle>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteModifierGroup(group.id)}
                          disabled={isLoading(`delete-modifier-group-${group.id}`)}
                          className="text-destructive"
                        >
                          {isLoading(`delete-modifier-group-${group.id}`) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {group.modifiers.map((modifier) => {
                          const ingredient = ingredients.find((ing) => ing.id === modifier.ingredientId);
                          if (!ingredient) return null;

                          return (
                            <div
                              key={modifier.id}
                              className={`flex items-center justify-between p-2 rounded ${
                                !ingredient.isAvailable
                                  ? "opacity-50 bg-destructive/10"
                                  : "bg-background/30"
                              }`}
                            >
                              <span className="text-sm">{ingredient.name}</span>
                              <div className="flex items-center gap-2">
                                {modifier.priceExtra > 0 && (
                                  <span className="text-sm text-[#f6cf62] font-medium">
                                    {formatPrice(modifier.priceExtra)}
                                  </span>
                                )}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteModifier(modifier.id)}
                                  disabled={isLoading(`delete-modifier-${modifier.id}`)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  {isLoading(`delete-modifier-${modifier.id}`) ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <X className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setVariationEditDialogOpen(false);
                    setEditingVariationFull(null);
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading(`update-variation-${editingVariationFull.id}`)}>
                  {isLoading(`update-variation-${editingVariationFull.id}`) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
