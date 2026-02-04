import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateSystemPrompt } from "@/lib/services/system-prompt";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const assistantId = body.assistantId || body.assistant?.id;
    const phoneNumber = body.phoneNumber || body.call?.phoneNumber;

    if (!assistantId && !phoneNumber) {
      return NextResponse.json(
        { error: "assistantId ou phoneNumber requis" },
        { status: 400 }
      );
    }

    let restaurant;

    if (assistantId) {
      const [found] = await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.vapiAssistantId, assistantId))
        .limit(1);
      restaurant = found;
    } else if (phoneNumber) {
      const [found] = await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.twilioPhoneNumber, phoneNumber))
        .limit(1);
      restaurant = found;
    }

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant non trouvé" },
        { status: 404 }
      );
    }

    const systemPrompt = await generateSystemPrompt(restaurant);

    return NextResponse.json({ systemPrompt });
  } catch (error) {
    logger.error("Erreur génération prompt Vapi", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de la génération du prompt" },
      { status: 500 }
    );
  }
}
