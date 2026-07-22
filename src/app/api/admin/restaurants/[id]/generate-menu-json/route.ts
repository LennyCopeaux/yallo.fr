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
        menuContext: restaurants.menuContext,
        hubriseAccessToken: restaurants.hubriseAccessToken,
        hubriseLocationId: restaurants.hubriseLocationId,
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
          restaurant.hubriseLocationId
        );
        return NextResponse.json({ menuJson: hubriseMenuJson });
      } catch (error) {
        logger.warn("Erreur récupération menu HubRise, fallback sur menuData", {
          restaurantId: id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (restaurant.menuData) {
      return NextResponse.json({
        menuJson: JSON.stringify(restaurant.menuData, null, 2)
      });
    }

    if (restaurant.menuContext) {
      return NextResponse.json({ menuJson: restaurant.menuContext });
    }

    return NextResponse.json({ menuJson: "Menu non configuré" });
  } catch (error) {
    logger.error("Erreur génération JSON menu", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de la génération du JSON" },
      { status: 500 }
    );
  }
}
