"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Utensils, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategorySidebar } from "./category-sidebar";
import { ItemsPanel } from "./items-panel";
import { ItemEditorDialog } from "./item-editor-sheet";
import { IngredientsTab } from "./ingredients-tab";
import { getMenuDataV2 } from "@/features/menu/actions-v2";
import { toast } from "sonner";

import type { Option, OptionGroup, Item, Category, MenuData } from "./types";

interface BackendCategory {
  id: string;
  name: string;
  rank: number;
  variations: BackendVariation[];
}

interface BackendVariation {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean | null;
  modifierGroups: BackendModifierGroup[];
}

interface BackendModifierGroup {
  id: string;
  ingredientCategoryId: string;
  minSelect: number;
  maxSelect: number;
  ingredientCategory?: {
    id: string;
    name: string;
  };
  modifiers: BackendModifier[];
}

interface BackendModifier {
  id: string;
  priceExtra: number;
  ingredient?: {
    id: string;
    name: string;
    isAvailable: boolean;
  };
}

interface BackendMenuData {
  restaurantId: string;
  categories: BackendCategory[];
    ingredients: Array<{
      id: string;
      name: string;
      ingredientCategoryId: string;
      price: number;
      isAvailable: boolean;
    }>;
  ingredientCategories: Array<{
    id: string;
    name: string;
    rank: number;
  }>;
}

interface MenuEditorProps {
  initialMenuData: BackendMenuData;
}

function transformMenuData(backendData: BackendMenuData): MenuData {
  return {
    restaurantId: backendData.restaurantId,
    categories: (backendData.categories || []).map((category: BackendCategory) => ({
      id: category.id,
      name: category.name,
      rank: category.rank,
      items: (category.variations || []).map((variation: BackendVariation) => ({
        id: variation.id,
        name: variation.name,
        price: variation.price,
        description: undefined,
        isAvailable: variation.isAvailable ?? true,
        optionGroups: (variation.modifierGroups || []).map((group: BackendModifierGroup) => ({
          id: group.id,
          title: group.ingredientCategory?.name || "",
          ingredientCategoryId: group.ingredientCategoryId,
          minSelect: group.minSelect,
          maxSelect: group.maxSelect,
          options: (group.modifiers || []).map((modifier: BackendModifier) => ({
            id: modifier.id,
            name: modifier.ingredient?.name || "",
            priceExtra: modifier.priceExtra,
            isAvailable: modifier.ingredient?.isAvailable ?? true,
          })),
        })),
      })),
    })),
    ingredients: backendData.ingredients || [],
    ingredientCategories: backendData.ingredientCategories || [],
  };
}

export function MenuEditor({ initialMenuData }: MenuEditorProps) {
  const [menuData, setMenuData] = useState<MenuData>(transformMenuData(initialMenuData));
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    menuData.categories[0]?.id || null
  );
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refreshMenuData() {
    setIsRefreshing(true);
    try {
      const freshData = await getMenuDataV2();
      if (freshData) {
        const transformed = transformMenuData(freshData as BackendMenuData);
        setMenuData(transformed);
        if (selectedCategoryId && !transformed.categories.find(c => c.id === selectedCategoryId)) {
          setSelectedCategoryId(transformed.categories[0]?.id || null);
        }
      }
    } catch (error) {
      toast.error("Erreur lors du rafraîchissement");
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  }

  const selectedCategory = menuData.categories.find(c => c.id === selectedCategoryId);

  function handleCreateItem() {
    if (!selectedCategoryId) {
      toast.error("Sélectionnez d'abord une catégorie");
      return;
    }
    const newItem: Item = {
      id: "new",
      name: "",
      price: 0,
      optionGroups: [],
    };
    setEditingItem(newItem);
    setIsSheetOpen(true);
  }

  function handleEditItem(item: Item) {
    setEditingItem(item);
    setIsSheetOpen(true);
  }

  function handleSheetClose() {
    setIsSheetOpen(false);
    setEditingItem(null);
    refreshMenuData();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Tabs defaultValue="menu" className="w-full flex flex-col flex-1 min-h-0">
        <TabsList className="bg-card/30 border-border p-1 h-12 flex-shrink-0">
          <TabsTrigger
            value="menu"
            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-10"
          >
            <Utensils className="w-4 h-4" />
            Carte & Menus
          </TabsTrigger>
          <TabsTrigger
            value="ingredients"
            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-10"
          >
            <ShoppingCart className="w-4 h-4" />
            Ingrédients & Options
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="mt-6 flex-1 flex flex-col min-h-0">
          <div className="flex flex-1 gap-6 min-h-0">
            <CategorySidebar
              categories={menuData.categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
              onRefresh={refreshMenuData}
              isRefreshing={isRefreshing}
            />

            <div className="flex-1 flex flex-col min-w-0">
              {selectedCategory ? (
                <ItemsPanel
                  category={selectedCategory}
                  menuData={menuData}
                  onEditItem={handleEditItem}
                  onCreateItem={handleCreateItem}
                  onRefresh={refreshMenuData}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center border border-border rounded-xl bg-card/30">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Aucune catégorie disponible</p>
                    <Button onClick={refreshMenuData} variant="outline" disabled={isRefreshing}>
                      {isRefreshing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Actualisation...
                        </>
                      ) : (
                        "Actualiser"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {editingItem && (
              <ItemEditorDialog
                item={editingItem}
                categoryId={selectedCategoryId!}
                isOpen={isSheetOpen}
                onClose={handleSheetClose}
                ingredientCategories={menuData.ingredientCategories}
                ingredients={menuData.ingredients}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="ingredients" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden">
          <IngredientsTab
            ingredientCategories={menuData.ingredientCategories}
            ingredients={menuData.ingredients}
            onRefresh={refreshMenuData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
