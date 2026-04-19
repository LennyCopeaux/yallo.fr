import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { fetchHubriseCatalog } from "@/lib/services/hubrise";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const [restaurant] = await db
      .select({
        menuData: restaurants.menuData,
        hubriseAccessToken: restaurants.hubriseAccessToken,
        hubriseLocationId: restaurants.hubriseLocationId,
        hubriseCatalogId: restaurants.hubriseCatalogId,
      })
      .from(restaurants)
      .where(eq(restaurants.id, id))
      .limit(1);

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant non trouvé" }, { status: 404 });
    }

    if (restaurant.hubriseAccessToken && restaurant.hubriseLocationId) {
      try {
        const hubriseMenuJson = await fetchHubriseCatalog(
          restaurant.hubriseAccessToken,
          restaurant.hubriseLocationId,
          restaurant.hubriseCatalogId
        );
        const parsedHubrise = JSON.parse(hubriseMenuJson) as Record<string, unknown>;
        // HubRise renvoie le catalogue sous `data` (categories, products, option_lists…), pas à la racine.
        const data =
          parsedHubrise.data !== undefined && typeof parsedHubrise.data === "object" && parsedHubrise.data !== null
            ? (parsedHubrise.data as Record<string, unknown>)
            : parsedHubrise;
        const categories = data.categories;
        const products = data.products;
        const hasCategories = Array.isArray(categories) && categories.length > 0;
        const hasProducts = Array.isArray(products) && products.length > 0;
        if (!hasCategories && !hasProducts) {
          return NextResponse.json({ menuJson: "Menu non configuré" });
        }
        return NextResponse.json({ menuJson: hubriseMenuJson });
      } catch (error) {
        logger.warn("Erreur récupération menu HubRise, fallback sur menuData", {
          restaurantId: id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (!restaurant.menuData?.categories?.length) {
      return NextResponse.json({ menuJson: "Menu non configuré" });
    }

    return NextResponse.json({ 
      menuJson: JSON.stringify(restaurant.menuData, null, 2) 
    });
  } catch (error) {
    logger.error("Erreur génération JSON menu", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de la génération du JSON" },
      { status: 500 }
    );
  }
}
