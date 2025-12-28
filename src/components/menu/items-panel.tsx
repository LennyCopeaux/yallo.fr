"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, Package, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { deleteVariation, toggleVariationAvailability } from "@/features/menu/actions-v2";

import type { Item, Category, MenuData } from "./types";

interface ItemsPanelProps {
  category: Category;
  menuData: MenuData;
  onEditItem: (item: Item) => void;
  onCreateItem: () => void;
  onRefresh: () => void;
}

export function ItemsPanel({
  category,
  menuData,
  onEditItem,
  onCreateItem,
  onRefresh,
}: ItemsPanelProps) {
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});

  async function handleDeleteItem(itemId: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      return;
    }

    setDeletingIds(prev => ({ ...prev, [itemId]: true }));
    try {
      const result = await deleteVariation(itemId);
      if (result.success) {
        toast.success("Article supprimé");
        onRefresh();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setDeletingIds(prev => ({ ...prev, [itemId]: false }));
    }
  }

  async function handleToggleAvailability(itemId: string, currentStatus: boolean) {
    setTogglingIds(prev => ({ ...prev, [itemId]: true }));
    try {
      const result = await toggleVariationAvailability(itemId, !currentStatus);
      if (result.success) {
        toast.success(currentStatus ? "Produit marqué comme indisponible" : "Produit marqué comme disponible");
        onRefresh();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setTogglingIds(prev => ({ ...prev, [itemId]: false }));
    }
  }

  function formatPrice(priceInCents: number): string {
    return (priceInCents / 100).toFixed(2).replace(".", ",") + "€";
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">{category.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {category.items.length} {category.items.length === 1 ? "article" : "articles"}
          </p>
        </div>
        <Button
          onClick={onCreateItem}
          className="bg-primary text-black hover:bg-primary/90 min-h-[44px]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {category.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-16 border border-border rounded-xl bg-card/30">
            <Package className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">Aucun produit dans cette catégorie</p>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre premier produit pour commencer
            </p>
            <Button onClick={onCreateItem} variant="outline" className="border-border min-h-[44px]">
              <Plus className="w-4 h-4 mr-2" />
              Créer un produit
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {category.items.map((item) => {
              const isUnavailable = item.isAvailable === false;
              
              return (
                <Card
                  key={item.id}
                  className={`group transition-all ${
                    isUnavailable
                      ? "opacity-60 border-muted bg-muted/10"
                      : "border-border bg-card hover:border-primary/30 hover:shadow-md"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className={`font-semibold text-base mb-1 ${
                              isUnavailable ? "text-muted-foreground line-through" : ""
                            }`}>
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-bold text-lg whitespace-nowrap ${
                              isUnavailable ? "text-muted-foreground" : "text-primary"
                            }`}>
                              {formatPrice(item.price)}
                            </span>
                            <Switch
                              checked={!isUnavailable}
                              onCheckedChange={() => handleToggleAvailability(item.id, !isUnavailable)}
                              disabled={togglingIds[item.id]}
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                        </div>

                        {item.optionGroups.length > 0 && (
                          <div className="space-y-2 mt-3 pt-3 border-t border-border/50">
                            {item.optionGroups.map((group) => {
                              const allCategoryIngredients = menuData.ingredients.filter(
                                ing => ing.ingredientCategoryId === group.ingredientCategoryId && ing.isAvailable
                              );
                              const selectedOptionNames = new Set(group.options.map(opt => opt.name));
                              const selectedIngredients = allCategoryIngredients.filter(ing => selectedOptionNames.has(ing.name));
                              const unselectedIngredients = allCategoryIngredients.filter(ing => !selectedOptionNames.has(ing.name));
                              const totalCount = allCategoryIngredients.length;
                              const selectedCount = selectedIngredients.length;
                              
                              return (
                                <div key={group.id} className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {group.title}
                                    </span>
                                    {totalCount > 0 && (
                                      <Badge variant="outline" className="text-xs h-5 px-1.5 border-muted text-muted-foreground">
                                        {selectedCount}/{totalCount}
                                      </Badge>
                                    )}
                                  </div>
                                  {(selectedIngredients.length > 0 || unselectedIngredients.length > 0) && (
                                    <div className="flex flex-wrap gap-1">
                                      {selectedIngredients.map((ingredient) => (
                                        <span
                                          key={ingredient.id}
                                          className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20"
                                        >
                                          {ingredient.name}
                                        </span>
                                      ))}
                                      {unselectedIngredients.length > 0 && (
                                        <>
                                          {unselectedIngredients.map((ingredient) => (
                                            <span
                                              key={ingredient.id}
                                              className="text-xs px-2 py-0.5 rounded-md bg-muted/30 text-muted-foreground line-through opacity-50"
                                            >
                                              {ingredient.name}
                                            </span>
                                          ))}
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditItem(item)}
                          className="h-9 w-9 sm:h-8 sm:w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={deletingIds[item.id]}
                          className="h-9 w-9 sm:h-8 sm:w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {deletingIds[item.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
