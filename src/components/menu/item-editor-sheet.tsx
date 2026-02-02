"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  createVariation,
  updateVariation,
  createModifierGroup,
  deleteModifierGroup,
  createModifier,
  deleteModifier,
} from "@/features/menu/actions-v2";

import type { Item } from "./types";

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
}

interface ItemEditorDialogProps {
  item: Item;
  categoryId: string;
  isOpen: boolean;
  onClose: () => void;
  ingredientCategories: IngredientCategory[];
  ingredients: Ingredient[];
}

function findIngredientId(
  ingredients: Ingredient[],
  optName: string,
  categoryId: string
): string {
  const ingredient = ingredients.find(
    ing => ing.name === optName && ing.ingredientCategoryId === categoryId
  );
  return ingredient?.id || "";
}

function extractIngredientIds(
  ingredients: Ingredient[],
  group: { options: Array<{ name: string }>; ingredientCategoryId: string }
): string[] {
  return group.options
    .map(opt => findIngredientId(ingredients, opt.name, group.ingredientCategoryId))
    .filter(Boolean);
}

function buildIngredientsByCategory(
  ingredients: Ingredient[],
  item: Item
): Record<string, string[]> {
  const ingredientsByCategory: Record<string, string[]> = {};
  item.optionGroups.forEach(group => {
    const ingredientIds = extractIngredientIds(ingredients, group);
    if (ingredientIds.length > 0) {
      ingredientsByCategory[group.ingredientCategoryId] = ingredientIds;
    }
  });
  return ingredientsByCategory;
}


function findModifierForIngredient(
  group: { options: Array<{ id: string; name: string }> },
  ingredients: Ingredient[],
  ingredientId: string
): { id: string; name: string } | undefined {
  return group.options.find(opt => {
    const ing = ingredients.find(i => i.id === ingredientId && i.name === opt.name);
    return ing;
  });
}

async function removeModifiersForIngredients(
  group: { options: Array<{ id: string; name: string }> },
  ingredients: Ingredient[],
  ingredientIdsToRemove: string[],
  deleteModifier: (id: string) => Promise<unknown>
): Promise<void> {
  for (const ingredientId of ingredientIdsToRemove) {
    const modifier = findModifierForIngredient(group, ingredients, ingredientId);
    if (modifier) {
      await deleteModifier(modifier.id);
    }
  }
}

async function addModifiersForIngredients(
  groupId: string,
  ingredientIdsToAdd: string[],
  createModifier: (formData: FormData) => Promise<unknown>
): Promise<void> {
  for (const ingredientId of ingredientIdsToAdd) {
    const modifierFormData = new FormData();
    modifierFormData.append("groupId", groupId);
    modifierFormData.append("ingredientId", ingredientId);
    modifierFormData.append("priceExtra", "0");
    await createModifier(modifierFormData);
  }
}

export function ItemEditorDialog({
  item,
  categoryId,
  isOpen,
  onClose,
  ingredientCategories,
  ingredients,
}: Readonly<ItemEditorDialogProps>) {
  const isNew = item.id === "new";
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState(item.description || "");
  const [selectedOptionCategoryIds, setSelectedOptionCategoryIds] = useState<string[]>([]);
  const [selectedIngredientsByCategory, setSelectedIngredientsByCategory] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isOpen) {
      setName(item.name);
      const priceInEuros = (item.price / 100).toFixed(2);
      setPrice(priceInEuros);
      setDescription(item.description || "");
      
      const categoryIds = item.optionGroups.map(group => group.ingredientCategoryId);
      setSelectedOptionCategoryIds(categoryIds);
      setSelectedIngredientsByCategory(buildIngredientsByCategory(ingredients, item));
      
      const expanded: Record<string, boolean> = {};
      categoryIds.forEach(id => {
        expanded[id] = true;
      });
      setExpandedCategories(expanded);
    }
  }, [item, isOpen, ingredients]);

  function handlePriceChange(value: string) {
    const numericValue = value.replace(/[^0-9.,]/g, "");
    const normalizedValue = numericValue.replaceAll(",", ".");
    setPrice(normalizedValue);
  }

  function toggleOptionCategory(categoryId: string) {
    setSelectedOptionCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        const newSelected = prev.filter(id => id !== categoryId);
        const newIngredients = { ...selectedIngredientsByCategory };
        delete newIngredients[categoryId];
        setSelectedIngredientsByCategory(newIngredients);
        setExpandedCategories(prev => ({ ...prev, [categoryId]: false }));
        return newSelected;
      } else {
        setExpandedCategories(prev => ({ ...prev, [categoryId]: true }));
        return [...prev, categoryId];
      }
    });
  }

  function toggleIngredient(categoryId: string, ingredientId: string) {
    setSelectedIngredientsByCategory(prev => {
      const current = prev[categoryId] || [];
      if (current.includes(ingredientId)) {
        return {
          ...prev,
          [categoryId]: current.filter(id => id !== ingredientId),
        };
      } else {
        return {
          ...prev,
          [categoryId]: [...current, ingredientId],
        };
      }
    });
  }

  function selectAllIngredients(categoryId: string) {
    const categoryIngredients = ingredients.filter(
      ing => ing.ingredientCategoryId === categoryId && ing.isAvailable
    );
    const allIds = categoryIngredients.map(ing => ing.id);
    setSelectedIngredientsByCategory(prev => ({
      ...prev,
      [categoryId]: allIds,
    }));
  }

  function deselectAllIngredients(categoryId: string) {
    setSelectedIngredientsByCategory(prev => {
      const newSelected = { ...prev };
      delete newSelected[categoryId];
      return newSelected;
    });
  }

  function validateForm(): string | null {
    if (!name.trim()) {
      return "Le nom du produit est requis";
    }
    const priceValue = price.trim();
    if (!priceValue) {
      return "Le prix est requis";
    }
    const priceInEuros = Number.parseFloat(priceValue);
    if (Number.isNaN(priceInEuros) || priceInEuros < 0) {
      return "Le prix doit être un nombre positif";
    }
    return null;
  }

  async function createOrUpdateVariation(): Promise<string> {
    const priceValue = price.trim();
    if (isNew) {
      const formData = new FormData();
      formData.append("categoryId", categoryId);
      formData.append("name", name.trim());
      formData.append("price", priceValue);
      const result = await createVariation(formData);
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la création");
      }
      return (result.data && typeof result.data === 'object' && 'id' in result.data) 
        ? (result.data as { id: string }).id 
        : item.id;
    }
    const updateFormData = new FormData();
    updateFormData.append("name", name.trim());
    updateFormData.append("price", priceValue);
    if (description.trim()) {
      updateFormData.append("description", description.trim());
    }
    const result = await updateVariation(item.id, updateFormData);
    if (!result.success) {
      throw new Error(result.error || "Erreur lors de la mise à jour");
    }
    return item.id;
  }

  async function createModifiersForGroup(groupId: string, categoryIdToAdd: string) {
    const selectedIngredientIds = selectedIngredientsByCategory[categoryIdToAdd] || [];
    const categoryIngredients = ingredients.filter(
      ing => ing.ingredientCategoryId === categoryIdToAdd && ing.isAvailable
    );
    const ingredientIdsToAdd = (selectedIngredientIds.length === 0 || selectedIngredientIds.length === categoryIngredients.length)
      ? categoryIngredients.map(ing => ing.id)
      : selectedIngredientIds;
    
    await addModifiersForIngredients(groupId, ingredientIdsToAdd, createModifier);
  }

  async function updateGroupIngredients(group: { id: string; ingredientCategoryId: string; options: Array<{ id: string; name: string }> }) {
    const selectedIngredientIds = selectedIngredientsByCategory[group.ingredientCategoryId] || [];
    const existingIngredientIds = extractIngredientIds(ingredients, group);
    const toAddIngredients = selectedIngredientIds.filter(id => !existingIngredientIds.includes(id));
    const toRemoveIngredients = existingIngredientIds.filter(id => !selectedIngredientIds.includes(id));

    await removeModifiersForIngredients(group, ingredients, toRemoveIngredients, deleteModifier);
    await addModifiersForIngredients(group.id, toAddIngredients, createModifier);
  }

  async function addNewModifierGroups(variationId: string, categoryIdsToAdd: string[]): Promise<void> {
    for (const categoryIdToAdd of categoryIdsToAdd) {
      const formData = new FormData();
      formData.append("variationId", variationId);
      formData.append("ingredientCategoryId", categoryIdToAdd);
      formData.append("minSelect", "0");
      formData.append("maxSelect", "1");
      const result = await createModifierGroup(formData);
      if (result.success && result.data && typeof result.data === 'object' && 'id' in result.data) {
        const groupId = (result.data as { id: string }).id;
        await createModifiersForGroup(groupId, categoryIdToAdd);
      }
    }
  }

  async function processExistingGroups(
    groups: Array<{ id: string; ingredientCategoryId: string; options: Array<{ id: string; name: string }> }>,
    categoryIdsToRemove: string[]
  ): Promise<void> {
    for (const group of groups) {
      if (categoryIdsToRemove.includes(group.ingredientCategoryId)) {
        await deleteModifierGroup(group.id);
      } else {
        await updateGroupIngredients(group);
      }
    }
  }

  async function handleSave() {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const variationId = await createOrUpdateVariation();
      const existingGroupIds = item.optionGroups.map(g => g.ingredientCategoryId);
      const toAdd = selectedOptionCategoryIds.filter(id => !existingGroupIds.includes(id));
      const toRemove = existingGroupIds.filter(id => !selectedOptionCategoryIds.includes(id));

      await addNewModifierGroups(variationId, toAdd);
      await processExistingGroups(item.optionGroups, toRemove);

      toast.success(isNew ? "Produit créé" : "Produit mis à jour");
      onClose();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Une erreur est survenue";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Nouveau produit" : "Modifier le produit"}</DialogTitle>
          <DialogDescription>
            {isNew
              ? "Créez un nouveau produit pour cette catégorie"
              : "Modifiez les informations du produit"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Wok Poulet"
              disabled={isSaving}
              className="bg-background/50 border-border focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Prix (€) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="12.50"
              disabled={isSaving}
              className="bg-background/50 border-border focus:border-primary/50"
            />
            <p className="text-xs text-muted-foreground">
              Exemple : tapez 12 pour 12.00€ ou 12.5 pour 12.50€
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description courte du produit..."
              rows={3}
              disabled={isSaving}
              className="bg-background/50 border-border focus:border-primary/50 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label>Options & Suppléments</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Sélectionnez les catégories d&apos;options, puis les ingrédients spécifiques pour chaque catégorie
            </p>
            {ingredientCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center border border-border rounded-lg bg-muted/20">
                Aucune catégorie d&apos;options disponible. Créez-en d&apos;abord dans l&apos;onglet &quot;Ingrédients & Options&quot;.
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto border border-border rounded-lg p-3 bg-background/30">
                {ingredientCategories.map((category) => {
                  const isSelected = selectedOptionCategoryIds.includes(category.id);
                  const isExpanded = expandedCategories[category.id] || false;
                  const categoryIngredients = ingredients.filter(
                    ing => ing.ingredientCategoryId === category.id && ing.isAvailable
                  );
                  const selectedIngredientIds = selectedIngredientsByCategory[category.id] || [];
                  const allSelected = categoryIngredients.length > 0 && selectedIngredientIds.length === categoryIngredients.length;

                  return (
                    <div key={category.id} className="border border-border rounded-lg bg-background/50">
                      <div className="flex items-center space-x-2 p-3 hover:bg-muted/30 rounded-t-lg transition-colors">
                        <Checkbox
                          id={`option-${category.id}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleOptionCategory(category.id)}
                          disabled={isSaving}
                        />
                        <label
                          htmlFor={`option-${category.id}`}
                          className="text-sm font-medium leading-none cursor-pointer flex-1"
                        >
                          {category.name}
                        </label>
                        {isSelected && categoryIngredients.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedCategories(prev => ({ ...prev, [category.id]: !isExpanded }))}
                            className="h-8 w-8 p-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      {isSelected && isExpanded && categoryIngredients.length > 0 && (
                        <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">
                              {selectedIngredientIds.length} / {categoryIngredients.length} sélectionnés
                            </span>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => selectAllIngredients(category.id)}
                                disabled={allSelected || isSaving}
                                className="h-7 text-xs"
                              >
                                Tout sélectionner
                              </Button>
                              {selectedIngredientIds.length > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deselectAllIngredients(category.id)}
                                  disabled={isSaving}
                                  className="h-7 text-xs"
                                >
                                  Tout désélectionner
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                            {categoryIngredients.map((ingredient) => (
                              <div
                                key={ingredient.id}
                                className="flex items-center space-x-2 py-1.5 px-2 hover:bg-muted/30 rounded transition-colors"
                              >
                                <Checkbox
                                  id={`ingredient-${ingredient.id}`}
                                  checked={selectedIngredientIds.includes(ingredient.id)}
                                  onCheckedChange={() => toggleIngredient(category.id, ingredient.id)}
                                  disabled={isSaving}
                                />
                                <label
                                  htmlFor={`ingredient-${ingredient.id}`}
                                  className="text-xs leading-none cursor-pointer flex-1"
                                >
                                  {ingredient.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="border-border hover:bg-muted/50 min-h-[44px]"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-black hover:bg-primary/90 min-h-[44px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isNew ? "Créer" : "Enregistrer"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
