import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, restaurants, type KitchenStatus } from "@/db/schema";
import { logger } from "@/lib/logger";
import { updateVapiAssistant } from "./vapi-agent";

type Restaurant = typeof restaurants.$inferSelect;

export type AutoRushDecision =
  | { action: "none" }
  | { action: "enable_rush" }
  | { action: "disable_rush"; nextStatus: "NORMAL" };

export type AutoRushInput = {
  threshold: number | null | undefined;
  currentStatus: KitchenStatus;
  autoRushActive: boolean;
  activeOrderCount: number;
};

/**
 * Seuil de sortie du mode RUSH : la moitie du seuil d'entree.
 * Sans cet ecart, une cuisine reglee sur 5 commandes basculerait RUSH / NORMAL
 * a chaque commande servie autour de la limite.
 */
export function getRushReleaseCount(threshold: number): number {
  return Math.floor(threshold / 2);
}

export function decideAutoRush(input: AutoRushInput): AutoRushDecision {
  const { threshold, currentStatus, autoRushActive, activeOrderCount } = input;

  // Bascule automatique desactivee.
  if (threshold === null || threshold === undefined || threshold <= 0) {
    return { action: "none" };
  }

  // STOP est une decision explicite du restaurateur : on n'y touche jamais.
  if (currentStatus === "STOP") {
    return { action: "none" };
  }

  if (currentStatus !== "RUSH") {
    return activeOrderCount >= threshold ? { action: "enable_rush" } : { action: "none" };
  }

  // Un RUSH mis a la main reste jusqu'a ce que le restaurateur le change.
  if (!autoRushActive) {
    return { action: "none" };
  }

  return activeOrderCount <= getRushReleaseCount(threshold)
    ? { action: "disable_rush", nextStatus: "NORMAL" }
    : { action: "none" };
}

async function countActiveOrders(restaurantId: string): Promise<number> {
  const [{ value }] = await db
    .select({ value: count() })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        inArray(orders.status, ["NEW", "PREPARING"])
      )
    );

  return value;
}

/**
 * Recalcule la charge cuisine et applique la bascule RUSH automatique.
 * Appele apres chaque creation de commande et chaque changement de statut.
 * N'echoue jamais : une erreur ici ne doit pas casser la prise de commande.
 */
export async function applyAutoRush(restaurant: Restaurant): Promise<KitchenStatus> {
  try {
    const activeOrderCount = await countActiveOrders(restaurant.id);

    const decision = decideAutoRush({
      threshold: restaurant.autoRushThreshold,
      currentStatus: restaurant.currentStatus,
      autoRushActive: restaurant.autoRushActive,
      activeOrderCount,
    });

    if (decision.action === "none") {
      return restaurant.currentStatus;
    }

    const nextStatus: KitchenStatus =
      decision.action === "enable_rush" ? "RUSH" : decision.nextStatus;
    const nextAutoRushActive = decision.action === "enable_rush";

    await db
      .update(restaurants)
      .set({
        currentStatus: nextStatus,
        autoRushActive: nextAutoRushActive,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurant.id));

    if (restaurant.vapiAssistantId) {
      try {
        await updateVapiAssistant(restaurant.vapiAssistantId, {
          ...restaurant,
          currentStatus: nextStatus,
          autoRushActive: nextAutoRushActive,
        });
      } catch (syncError) {
        logger.error(
          "Bascule auto-rush enregistree mais sync VAPI en echec",
          syncError instanceof Error ? syncError : new Error(String(syncError)),
          { restaurantId: restaurant.id, nextStatus }
        );
      }
    }

    logger.info("Bascule automatique de la charge cuisine", {
      restaurantId: restaurant.id,
      from: restaurant.currentStatus,
      to: nextStatus,
      activeOrderCount,
      threshold: restaurant.autoRushThreshold,
    });

    return nextStatus;
  } catch (error) {
    logger.error(
      "Erreur lors du calcul auto-rush",
      error instanceof Error ? error : new Error(String(error)),
      { restaurantId: restaurant.id }
    );
    return restaurant.currentStatus;
  }
}
