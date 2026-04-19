import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateSystemPrompt } from "@/lib/services/system-prompt";
import { logger } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id))
      .limit(1);

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant non trouvé" }, { status: 404 });
    }

    const systemPrompt = await generateSystemPrompt(restaurant);

    return NextResponse.json({ systemPrompt });
  } catch (error) {
    logger.error("Erreur génération prompt", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de la génération du prompt" },
      { status: 500 }
    );
  }
}

