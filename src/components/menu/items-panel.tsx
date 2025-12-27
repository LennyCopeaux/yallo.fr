"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Edit2, Trash2, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { deleteVariation } from "@/features/menu/actions-v2";

import type { Option, OptionGroup, Item, Category } from "./types";

interface ItemsPanelProps {
  category: Category;
  onEditItem: (item: Item) => void;
  onCreateItem: () => void;
  onRefresh: () => void;
}

export function ItemsPanel({
  category,
  onEditItem,
  onCreateItem,
  onRefresh,
}: ItemsPanelProps) {
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

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

  function formatPrice(priceInCents: number): string {
    return (priceInCents / 100).toFixed(2).replace(".", ",") + "€";
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-bold">{category.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {category.items.length} {category.items.length === 1 ? "article" : "articles"}
          </p>
        </div>
        <Button
          onClick={onCreateItem}
          className="bg-primary text-black hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Liste des articles */}
      <div className="flex-1 overflow-y-auto">
        {category.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full border border-border rounded-xl bg-card/30">
            <Package className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">Aucun article dans cette catégorie</p>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre premier article pour commencer
            </p>
            <Button onClick={onCreateItem} variant="outline" className="border-border">
              <Plus className="w-4 h-4 mr-2" />
              Créer un article
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-card/50 border-border hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="p-4">
                    {/* Image placeholder */}
                    {item.imageUrl ? (
                      <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 mb-3 rounded-lg bg-muted/50 flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground opacity-30" />
                      </div>
                    )}

                    {/* Nom et prix */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-base flex-1">{item.name}</h3>
                      <span className="text-lg font-bold text-primary ml-2">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Badges pour les groupes d'options */}
                    {item.optionGroups.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.optionGroups.map((group) => (
                          <Badge
                            key={group.id}
                            variant="secondary"
                            className="text-xs bg-primary/10 text-primary border-primary/20"
                          >
                            {group.title}
                            {group.minSelect > 0 && (
                              <span className="ml-1 text-muted-foreground">
                                ({group.minSelect === group.maxSelect
                                  ? `${group.minSelect}`
                                  : `${group.minSelect}-${group.maxSelect}`})
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditItem(item)}
                        className="flex-1 hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={deletingIds[item.id]}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {deletingIds[item.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

