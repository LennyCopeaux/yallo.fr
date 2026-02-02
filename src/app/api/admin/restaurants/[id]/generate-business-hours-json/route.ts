import { NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    let parsedHours;
    
    if (restaurant.businessHours) {
      try {
        parsedHours = JSON.parse(restaurant.businessHours);
      } catch {
        parsedHours = null;
      }
    }
    
    if (!parsedHours) {
      const defaultHours = {
        timezone: "Europe/Paris",
        schedule: {
          monday: { open: "11:00", close: "22:00" },
          tuesday: { open: "11:00", close: "22:00" },
          wednesday: { open: "11:00", close: "22:00" },
          thursday: { open: "11:00", close: "22:00" },
          friday: { open: "11:00", close: "23:00" },
          saturday: { open: "11:00", close: "23:00" },
          sunday: { open: "11:00", close: "22:00" },
        },
      };
      return NextResponse.json({ businessHoursJson: JSON.stringify(defaultHours, null, 2) });
    }

    const businessHours = {
      timezone: parsedHours.timezone || "Europe/Paris",
      schedule: parsedHours.schedule || {},
    };

    return NextResponse.json({ businessHoursJson: JSON.stringify(businessHours, null, 2) });
  } catch (error) {
    console.error("Erreur génération JSON horaires:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du JSON" },
      { status: 500 }
    );
  }
}

