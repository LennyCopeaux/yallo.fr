"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  createVariation,
  updateVariation,
  createModifierGroup,
  deleteModifierGroup,
  createModifier,
  deleteModifier,
} from "@/features/menu/actions-v2";

import type { Option, OptionGroup, Item } from "./types";

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

interface ItemEditorSheetProps {
  item: Item;
  categoryId: string;
  isOpen: boolean;
  onClose: () => void;
  ingredientCategories: IngredientCategory[];
  ingredients: Ingredient[];
}

export function ItemEditorDialog({
  item,
  categoryId,
  isOpen,
  onClose,
  ingredientCategories,
  ingredients,
}: ItemEditorSheetProps) {
  const isNew = item.id === "new";
  const [isSaving, setIsSaving] = useState(false);
  const [deletingGroupIds, setDeletingGroupIds] = useState<Record<string, boolean>>({});
  const [deletingOptionIds, setDeletingOptionIds] = useState<Record<string, boolean>>({});

  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState((item.price / 100).toFixed(2));
  const [description, setDescription] = useState(item.description || "");
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>(item.optionGroups || []);

  useEffect(() => {
    if (isOpen) {
      setName(item.name);
      setPrice((item.price / 100).toFixed(2));
      setDescription(item.description || "");
      setOptionGroups(item.optionGroups || []);
    }
  }, [item, isOpen]);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Le nom de l'article est requis");
      return;
    }

    const priceInCents = Math.round(parseFloat(price.replace(",", ".")) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      toast.error("Le prix doit être un nombre positif");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("categoryId", categoryId);
      formData.append("name", name.trim());
      formData.append("price", priceInCents.toString());

      if (isNew) {
        const result = await createVariation(formData);
        if (!result.success) {
          toast.error(result.error || "Erreur lors de la création");
          setIsSaving(false);
          return;
        }
      } else {
        const updateFormData = new FormData();
        updateFormData.append("name", name.trim());
        updateFormData.append("price", priceInCents.toString());
        const result = await updateVariation(item.id, updateFormData);
        if (!result.success) {
          toast.error(result.error || "Erreur lors de la mise à jour");
          setIsSaving(false);
          return;
        }
      }

      toast.success(isNew ? "Article créé" : "Article mis à jour");
      onClose();
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddOptionGroup() {
    if (ingredientCategories.length === 0) {
      toast.error("Aucune catégorie d'ingrédients disponible. Créez-en d'abord dans l'onglet Ingrédients.");
      return;
    }

    const newGroup: OptionGroup = {
      id: `temp-${Date.now()}`,
      title: "",
      ingredientCategoryId: ingredientCategories[0].id,
      minSelect: 1,
      maxSelect: 1,
      options: [],
    };
    setOptionGroups([...optionGroups, newGroup]);
  }

  async function handleDeleteOptionGroup(groupId: string) {
    if (!confirm("Supprimer ce groupe d'options ?")) return;

    if (groupId.startsWith("temp-")) {
      setOptionGroups(optionGroups.filter(g => g.id !== groupId));
      return;
    }

    setDeletingGroupIds(prev => ({ ...prev, [groupId]: true }));
    try {
      const result = await deleteModifierGroup(groupId);
      if (result.success) {
        toast.success("Groupe d'options supprimé");
        setOptionGroups(optionGroups.filter(g => g.id !== groupId));
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setDeletingGroupIds(prev => ({ ...prev, [groupId]: false }));
    }
  }

  async function handleAddOption(groupId: string) {
    const group = optionGroups.find(g => g.id === groupId);
    if (!group) return;

    const availableIngredients = ingredients.filter(
      ing => ing.ingredientCategoryId === group.ingredientCategoryId && ing.isAvailable
    );

    if (availableIngredients.length === 0) {
      toast.error("Aucun ingrédient disponible dans cette catégorie");
      return;
    }

    const newOption: Option = {
      id: `temp-option-${Date.now()}`,
      name: availableIngredients[0].name,
      priceExtra: 0,
      isAvailable: true,
    };

    setOptionGroups(
      optionGroups.map(g =>
        g.id === groupId
          ? { ...g, options: [...g.options, newOption] }
          : g
      )
    );
  }

  async function handleDeleteOption(groupId: string, optionId: string) {
    if (optionId.startsWith("temp-option-")) {
      setOptionGroups(
        optionGroups.map(g =>
          g.id === groupId
            ? { ...g, options: g.options.filter(o => o.id !== optionId) }
            : g
        )
      );
      return;
    }

    setDeletingOptionIds(prev => ({ ...prev, [optionId]: true }));
    try {
      const result = await deleteModifier(optionId);
      if (result.success) {
        toast.success("Option supprimée");
        setOptionGroups(
          optionGroups.map(g =>
            g.id === groupId
              ? { ...g, options: g.options.filter(o => o.id !== optionId) }
              : g
          )
        );
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setDeletingOptionIds(prev => ({ ...prev, [optionId]: false }));
    }
  }

  function formatPrice(priceInCents: number): string {
    return (priceInCents / 100).toFixed(2).replace(".", ",") + "€";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle>{isNew ? "Nouvel article" : "Modifier l'article"}</DialogTitle>
          <DialogDescription>
            {isNew
              ? "Créez un nouvel article avec ses options"
              : "Modifiez les détails de l'article et ses groupes d'options"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Nom de l'article *</Label>
              <Input
                id="item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Wok Poulet"
                className="bg-background/50 border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-price">Prix de base *</Label>
                <Input
                  id="item-price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="7.50"
                  className="bg-background/50 border-border"
                />
                <p className="text-xs text-muted-foreground">En euros</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de l'article..."
                rows={3}
                className="bg-background/50 border-border"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Groupes d'options</h3>
                <p className="text-sm text-muted-foreground">
                  Ajoutez des choix obligatoires ou optionnels pour cet article
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOptionGroup}
                className="border-border"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un groupe
              </Button>
            </div>

            {optionGroups.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Aucun groupe d'options. Ajoutez-en un pour permettre aux clients de personnaliser cet article.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {optionGroups.map((group) => {
                  const category = ingredientCategories.find(c => c.id === group.ingredientCategoryId);
                  const availableIngredients = ingredients.filter(
                    ing => ing.ingredientCategoryId === group.ingredientCategoryId && ing.isAvailable
                  );

                  return (
                    <div
                      key={group.id}
                      className="border border-border rounded-lg p-4 bg-background/30"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {category?.name || "Catégorie"}
                            </Badge>
                            {group.minSelect > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {group.minSelect === group.maxSelect
                                  ? `${group.minSelect} choix`
                                  : `${group.minSelect}-${group.maxSelect} choix`}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium">
                            {group.title || "Sans titre"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOptionGroup(group.id)}
                          disabled={deletingGroupIds[group.id]}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          {deletingGroupIds[group.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {group.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center justify-between p-2 bg-background/50 rounded border border-border"
                          >
                            <div className="flex-1">
                              <span className="text-sm">{option.name}</span>
                              {option.priceExtra > 0 && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  +{formatPrice(option.priceExtra)}
                                </span>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteOption(group.id, option.id)}
                              disabled={deletingOptionIds[option.id]}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {deletingOptionIds[option.id] ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddOption(group.id)}
                          className="w-full border-border text-xs"
                          disabled={availableIngredients.length === 0}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Ajouter une option
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="border-border"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="bg-primary text-black hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isNew ? "Création..." : "Enregistrement..."}
              </>
            ) : (
              isNew ? "Créer" : "Enregistrer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

