export interface Option {
  id: string;
  name: string;
  priceExtra: number;
  isAvailable: boolean;
}

export interface OptionGroup {
  id: string;
  title: string;
  ingredientCategoryId: string;
  minSelect: number;
  maxSelect: number;
  options: Option[];
}

export interface Item {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string | null;
  optionGroups: OptionGroup[];
}

export interface Category {
  id: string;
  name: string;
  rank: number;
  items: Item[];
}

export interface MenuData {
  restaurantId: string;
  categories: Category[];
  ingredients: Array<{
    id: string;
    name: string;
    ingredientCategoryId: string;
    price: number;
    isAvailable: boolean;
    imageUrl: string | null;
  }>;
  ingredientCategories: Array<{
    id: string;
    name: string;
    rank: number;
  }>;
}

