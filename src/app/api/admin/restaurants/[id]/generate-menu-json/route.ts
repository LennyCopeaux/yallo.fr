import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { fetchHubriseCatalog } from "@/lib/services/hubrise";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }
  return session;
}

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
        const parsedHubrise = JSON.parse(hubriseMenuJson);
        const isEmpty = !parsedHubrise.categories || parsedHubrise.categories.length === 0;
        if (isEmpty) {
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

    if (!restaurant.menuData || !restaurant.menuData.categories || restaurant.menuData.categories.length === 0) {
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
