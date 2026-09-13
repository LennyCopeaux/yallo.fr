import type { MenuData } from "@/db/schema";

/**
 * Compléments réellement proposables en vente additionnelle.
 *
 * L'assistant ne peut pas décider seul s'il a quelque chose à proposer : il
 * proposait « une boisson ou un dessert » sur un menu qui n'en contient aucun,
 * puis devait se rattraper en annonçant l'absence au client. On calcule donc la
 * liste ici, à partir du menu, et on ne parle d'upsell dans le prompt que si
 * cette liste n'est pas vide.
 */

/** Nombre de suggestions injectées dans le prompt : assez pour varier, pas assez pour noyer. */
const MAX_SUGGESTIONS = 8;

/**
 * Catégories de menu considérées comme des compléments. Un plat principal ne
 * fait pas un upsell : on ne veut ni proposer une pizza en supplément d'une
 * pizza, ni proposer un composant qui n'est pas commandable seul.
 */
const COMPLEMENT_KEYWORDS = [
  // Boissons
  "boisson",
  "boissons",
  "drink",
  "drinks",
  "soda",
  "sodas",
  "soft",
  "softs",
  "biere",
  "bieres",
  "vin",
  "vins",
  "eau",
  "eaux",
  "cafe",
  "cafes",
  "the",
  "thes",
  "jus",
  "limonade",
  "milkshake",
  "milkshakes",
  // Desserts
  "dessert",
  "desserts",
  "glace",
  "glaces",
  "patisserie",
  "patisseries",
  "gateau",
  "gateaux",
  "sucre",
  "sucres",
  // Accompagnements
  "accompagnement",
  "accompagnements",
  "side",
  "sides",
  "frite",
  "frites",
  "potato",
  "potatoes",
  "salade",
  "salades",
  "snack",
  "snacks",
  "entree",
  "entrees",
  // Suppléments
  "supplement",
  "supplements",
  "sauce",
  "sauces",
  "extra",
  "extras",
  "topping",
  "toppings",
];

export type UpsellCandidates = {
  /** Vrai s'il existe au moins un produit commandable à proposer. */
  hasAny: boolean;
  /** Noms exacts issus du menu : l'assistant ne doit citer que ceux-là. */
  suggestions: string[];
};

const EMPTY_CANDIDATES: UpsellCandidates = { hasAny: false, suggestions: [] };

/** Minuscules sans accents : « Boissons & Cafés » et « boissons cafes » doivent matcher. */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isComplementCategory(categoryName: string): boolean {
  const normalized = normalize(categoryName);

  // Comparaison mot à mot : « the » ne doit pas matcher « thermidor », et
  // « eau » ne doit pas matcher « beaujolais ».
  const words = new Set(normalized.split(/[^a-z0-9]+/).filter(Boolean));
  return COMPLEMENT_KEYWORDS.some((keyword) => words.has(keyword));
}

/**
 * Un produit n'est proposable que s'il a au moins un SKU : sans prix, l'assistant
 * ne pourrait pas remplir `unit_price` dans submit_order.
 */
function isOrderable(product: { skus?: unknown }): boolean {
  return Array.isArray(product.skus) && product.skus.length > 0;
}

export function findUpsellCandidates(menu: unknown): UpsellCandidates {
  const categories = (menu as MenuData | null | undefined)?.categories;
  if (!Array.isArray(categories)) return EMPTY_CANDIDATES;

  const suggestions: string[] = [];

  for (const category of categories) {
    if (!category?.name || !Array.isArray(category.products)) continue;
    if (!isComplementCategory(category.name)) continue;

    for (const product of category.products) {
      if (!product?.name || !isOrderable(product)) continue;
      if (suggestions.includes(product.name)) continue;

      suggestions.push(product.name);
      if (suggestions.length >= MAX_SUGGESTIONS) {
        return { hasAny: true, suggestions };
      }
    }
  }

  return suggestions.length > 0
    ? { hasAny: true, suggestions }
    : EMPTY_CANDIDATES;
}
