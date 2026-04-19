import { NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  const { id } = await params;
  
  const [restaurant] = await db
    .select({ businessHours: restaurants.businessHours })
    .from(restaurants)
    .where(eq(restaurants.id, id))
    .limit(1);

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  try {
    if (!restaurant.businessHours) {
      return NextResponse.json({ businessHoursJson: "Horaires d'ouverture non configurée" });
    }

    let parsedHours;
    try {
      parsedHours = JSON.parse(restaurant.businessHours);
    } catch {
      return NextResponse.json({ businessHoursJson: "Horaires d'ouverture non configurée" });
    }

    if (!parsedHours?.schedule || Object.keys(parsedHours.schedule).length === 0) {
      return NextResponse.json({ businessHoursJson: "Horaires d'ouverture non configurée" });
    }

    const businessHours = {
      timezone: parsedHours.timezone || "Europe/Paris",
      schedule: parsedHours.schedule,
    };

    return NextResponse.json({ businessHoursJson: JSON.stringify(businessHours, null, 2) });
  } catch (error) {
    logger.error("Erreur génération JSON horaires", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de la génération du JSON" },
      { status: 500 }
    );
  }
}

