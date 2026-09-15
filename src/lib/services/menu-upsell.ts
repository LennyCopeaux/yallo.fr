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
export type ComplementKind = "drink" | "dessert" | "other";

const DRINK_KEYWORDS = [
  "boisson", "boissons", "drink", "drinks", "soda", "sodas", "soft", "softs",
  "biere", "bieres", "vin", "vins", "eau", "eaux", "cafe", "cafes", "the", "thes",
  "jus", "limonade", "milkshake", "milkshakes",
];

const DESSERT_KEYWORDS = [
  "dessert", "desserts", "glace", "glaces", "patisserie", "patisseries",
  "gateau", "gateaux", "sucre", "sucres",
];

/**
 * Accompagnements et suppléments : proposables, mais sans logique « déjà pris »
 * particulière — on les cite seulement si le client n'a ni boisson ni dessert
 * à proposer.
 */
const OTHER_COMPLEMENT_KEYWORDS = [
  "accompagnement", "accompagnements", "side", "sides", "frite", "frites",
  "potato", "potatoes", "salade", "salades", "snack", "snacks", "entree", "entrees",
  "supplement", "supplements", "sauce", "sauces", "extra", "extras", "topping", "toppings",
];

export type UpsellCandidates = {
  /** Vrai s'il existe au moins un produit commandable à proposer. */
  hasAny: boolean;
  /** Noms exacts issus du menu : l'assistant ne doit citer que ceux-là. */
  suggestions: string[];
  /** Les mêmes noms, triés par nature pour adapter la proposition à ce que le client a déjà pris. */
  drinks: string[];
  desserts: string[];
  others: string[];
};

const EMPTY_CANDIDATES: UpsellCandidates = {
  hasAny: false,
  suggestions: [],
  drinks: [],
  desserts: [],
  others: [],
};

/** Minuscules sans accents : « Boissons & Cafés » et « boissons cafes » doivent matcher. */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Nature du complément d'après le nom de la catégorie, ou null si la
 * catégorie n'est pas un complément (plat principal, composant…).
 */
function classifyComplementCategory(categoryName: string): ComplementKind | null {
  const normalized = normalize(categoryName);

  // Comparaison mot à mot : « the » ne doit pas matcher « thermidor », et
  // « eau » ne doit pas matcher « beaujolais ».
  const words = new Set(normalized.split(/[^a-z0-9]+/).filter(Boolean));
  if (DRINK_KEYWORDS.some((keyword) => words.has(keyword))) return "drink";
  if (DESSERT_KEYWORDS.some((keyword) => words.has(keyword))) return "dessert";
  if (OTHER_COMPLEMENT_KEYWORDS.some((keyword) => words.has(keyword))) return "other";
  return null;
}

/**
 * Un produit n'est proposable que s'il a au moins un prix : sans prix,
 * l'assistant ne pourrait pas remplir `unit_price` dans submit_order.
 */
function isOrderable(product: { skus?: unknown }): boolean {
  return Array.isArray(product.skus) && product.skus.length > 0;
}

/**
 * Menu importé depuis une photo (menu-parser) : `donnees_menu[]` avec
 * `categorie`, `articles[]`, `nom` et `tarifs[{ prix, label }]`. Ce format
 * coexiste avec le format structuré `categories/products/skus` du même champ
 * `menuData`, et le prompt reçoit l'un ou l'autre tel quel.
 */
type PhotoMenuTariff = { prix?: unknown; label?: unknown };
type PhotoMenuArticle = { nom?: unknown; tarifs?: unknown };
type PhotoMenuSection = { categorie?: unknown; articles?: unknown };

function hasPricedTariff(article: PhotoMenuArticle): boolean {
  if (!Array.isArray(article.tarifs)) return false;
  return (article.tarifs as PhotoMenuTariff[]).some((t) => {
    const raw = typeof t?.prix === "number" ? String(t.prix) : String(t?.prix ?? "").trim();
    return raw.length > 0 && Number.isFinite(Number.parseFloat(raw.replace(",", ".")));
  });
}

type Collector = { suggestions: string[]; drinks: string[]; desserts: string[]; others: string[] };

const BUCKET: Record<ComplementKind, keyof Collector> = {
  drink: "drinks",
  dessert: "desserts",
  other: "others",
};

/** Ajoute un nom ; renvoie true quand le quota de suggestions est atteint. */
function pushSuggestion(collector: Collector, kind: ComplementKind, name: string): boolean {
  if (collector.suggestions.includes(name)) return false;
  collector.suggestions.push(name);
  collector[BUCKET[kind]].push(name);
  return collector.suggestions.length >= MAX_SUGGESTIONS;
}

function collectFromStructuredMenu(menu: MenuData, collector: Collector): boolean {
  for (const category of menu.categories) {
    if (!category?.name || !Array.isArray(category.products)) continue;
    const kind = classifyComplementCategory(category.name);
    if (!kind) continue;

    for (const product of category.products) {
      if (!product?.name || !isOrderable(product)) continue;
      if (pushSuggestion(collector, kind, product.name)) return true;
    }
  }
  return false;
}

function collectFromPhotoMenu(sections: PhotoMenuSection[], collector: Collector): boolean {
  for (const section of sections) {
    if (typeof section?.categorie !== "string" || !Array.isArray(section.articles)) continue;
    const kind = classifyComplementCategory(section.categorie);
    if (!kind) continue;

    for (const article of section.articles as PhotoMenuArticle[]) {
      if (typeof article?.nom !== "string" || article.nom.trim().length === 0) continue;
      if (!hasPricedTariff(article)) continue;
      if (pushSuggestion(collector, kind, article.nom.trim())) return true;
    }
  }
  return false;
}

export function findUpsellCandidates(menu: unknown): UpsellCandidates {
  if (menu === null || typeof menu !== "object") return EMPTY_CANDIDATES;

  const collector: Collector = { suggestions: [], drinks: [], desserts: [], others: [] };
  const record = menu as Record<string, unknown>;

  const sections = record.donnees_menu;
  if (Array.isArray(sections)) {
    collectFromPhotoMenu(sections as PhotoMenuSection[], collector);
  }

  const categories = record.categories;
  if (
    collector.suggestions.length < MAX_SUGGESTIONS &&
    Array.isArray(categories) &&
    categories.some((c) => c !== null && typeof c === "object")
  ) {
    collectFromStructuredMenu({ categories, option_lists: [] } as MenuData, collector);
  }

  return collector.suggestions.length > 0
    ? { hasAny: true, ...collector }
    : EMPTY_CANDIDATES;
}
