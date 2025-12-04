"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShoppingCart, Utensils } from "lucide-react";
import { IngredientList, ProductGrid } from "./_components";

// Types
interface IngredientCategory {
  id: string;
  name: string;
  rank: number;
}

// Ingredient complet avec sa catégorie (utilisé dans la liste des ingrédients)
interface Ingredient {
  id: string;
  name: string;
  ingredientCategoryId: string;
  price: number;
  isAvailable: boolean;
  imageUrl: string | null;
  ingredientCategory: IngredientCategory;
}

// Ingredient simplifié sans la catégorie (utilisé dans les modificateurs)
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

interface MenuData {
  restaurantId: string;
  categories: Category[];
  ingredients: Ingredient[];
  ingredientCategories: IngredientCategory[];
}

interface MenuClientV2Props {
  menuData: MenuData;
}

export function MenuClientV2({ menuData }: MenuClientV2Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestion du Menu</h1>
        <p className="text-muted-foreground">
          Gérez vos produits, variations, ingrédients et prix
        </p>
      </div>

      {/* Tabs principaux */}
      <Tabs defaultValue="ingredients" className="w-full">
        <TabsList className="bg-card/30 border-border p-1 h-12">
          <TabsTrigger
            value="ingredients"
            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-10"
          >
            <ShoppingCart className="w-4 h-4" />
            Ingrédients & Stock
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-10"
          >
            <Utensils className="w-4 h-4" />
            Produits
          </TabsTrigger>
        </TabsList>

        {/* Onglet Ingrédients & Stock */}
        <TabsContent value="ingredients" className="mt-6">
          <IngredientList
            ingredients={menuData.ingredients}
            ingredientCategories={menuData.ingredientCategories}
          />
        </TabsContent>

        {/* Onglet Produits */}
        <TabsContent value="products" className="mt-6">
          <ProductGrid
            categories={menuData.categories}
            ingredients={menuData.ingredients}
            ingredientCategories={menuData.ingredientCategories}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
