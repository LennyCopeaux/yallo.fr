import type { MenuData } from "@/db/schema";

/**
 * Résumé déterministe des tailles, calculé côté serveur.
 *
 * Laisser le modèle déduire « cet article a-t-il une taille ? » en lisant le
 * JSON ne suffit pas : après une pizza en trois tailles, il redemandait la
 * taille d'une salade. On lui donne donc la liste fermée des articles à tailles,
 * par catégorie, et on affirme que tout le reste n'en a pas.
 */

type SizeEntry = { name: string; labels: string[] };
type CategorySizes = { category: string; sized: SizeEntry[]; total: number };

function normalizeLabel(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function fromStructuredMenu(menu: MenuData): CategorySizes[] {
  const result: CategorySizes[] = [];
  for (const category of menu.categories) {
    if (!category?.name || !Array.isArray(category.products)) continue;
    const sized: SizeEntry[] = [];
    for (const product of category.products) {
      if (!product?.name || !Array.isArray(product.skus) || product.skus.length < 2) continue;
      sized.push({ name: product.name, labels: product.skus.map((s) => normalizeLabel(s?.name)).filter(Boolean) });
    }
    result.push({ category: category.name, sized, total: category.products.length });
  }
  return result;
}

type PhotoSection = { categorie?: unknown; articles?: unknown };
type PhotoArticle = { nom?: unknown; tarifs?: unknown };

function fromPhotoMenu(sections: PhotoSection[]): CategorySizes[] {
  const result: CategorySizes[] = [];
  for (const section of sections) {
    if (typeof section?.categorie !== "string" || !Array.isArray(section.articles)) continue;
    const sized: SizeEntry[] = [];
    for (const article of section.articles as PhotoArticle[]) {
      if (typeof article?.nom !== "string" || !Array.isArray(article.tarifs) || article.tarifs.length < 2) continue;
      const labels = (article.tarifs as Array<{ label?: unknown }>).map((t) => normalizeLabel(t?.label)).filter(Boolean);
      sized.push({ name: article.nom.trim(), labels });
    }
    result.push({ category: section.categorie, sized, total: section.articles.length });
  }
  return result;
}

function collectCategorySizes(menu: unknown): CategorySizes[] {
  if (menu === null || typeof menu !== "object") return [];
  const record = menu as Record<string, unknown>;

  if (Array.isArray(record.donnees_menu)) {
    return fromPhotoMenu(record.donnees_menu as PhotoSection[]);
  }
  if (Array.isArray(record.categories) && record.categories.some((c) => c !== null && typeof c === "object")) {
    return fromStructuredMenu({ categories: record.categories, option_lists: [] } as MenuData);
  }
  return [];
}

function sameLabels(entries: SizeEntry[]): string[] | null {
  const first = entries[0]?.labels.join("|");
  if (!first) return null;
  return entries.every((e) => e.labels.join("|") === first) ? entries[0].labels : null;
}

/**
 * Bloc de prompt. Renvoie une chaîne vide si le menu est inconnu, pour ne pas
 * affirmer « aucune taille » sur un menu qu'on n'a pas pu lire.
 */
export function buildSizeSummaryBlock(menu: unknown): string {
  const categories = collectCategorySizes(menu);
  if (categories.length === 0) return "";

  const withSizes = categories.filter((c) => c.sized.length > 0);
  const withoutSizes = categories.filter((c) => c.sized.length === 0).map((c) => c.category);

  const lines: string[] = [];
  for (const c of withSizes) {
    const shared = c.sized.length === c.total ? sameLabels(c.sized) : null;
    if (shared) {
      lines.push(`- ${c.category} : tous les articles existent en ${shared.join(", ")}. Demande la taille avec ces mots.`);
      continue;
    }
    const detail = c.sized
      .map((e) => (e.labels.length > 0 ? `${e.name} (${e.labels.join(", ")})` : `${e.name} (plusieurs tarifs)`))
      .join(" ; ");
    lines.push(`- ${c.category} : seuls ${detail} ont une taille. Les autres articles de cette catégorie n'en ont pas.`);
  }

  const noneLine =
    withoutSizes.length > 0
      ? `- ${withoutSizes.join(", ")} : AUCUN article n'a de taille. Ne pose jamais de question de taille sur ces catégories, même juste après une pizza.`
      : "";

  const header =
    withSizes.length === 0
      ? "LISTE FERMÉE DES TAILLES — calculée depuis le JSON : aucun article de ce menu n'a de taille. Ne pose JAMAIS de question de taille."
      : "LISTE FERMÉE DES TAILLES — calculée depuis le JSON, elle fait foi :";

  return [header, ...lines, noneLine, "- Tout article absent de cette liste a un prix unique : tu ne demandes rien, tu l'ajoutes."]
    .filter(Boolean)
    .join("\n");
}
