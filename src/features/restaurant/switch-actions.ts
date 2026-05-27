"use server";

import { cookies } from "next/headers";
import { getUserRestaurants, RESTAURANT_COOKIE } from "@/lib/auth";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

/**
 * Sélectionne le restaurant actif pour l'utilisateur connecté.
 * Valide que le restaurant est accessible via restaurant_members.
 */
export async function switchRestaurant(restaurantId: string): Promise<void> {
  const accessible = await getUserRestaurants();
  const belongs = accessible.some((r) => r.id === restaurantId);
  if (!belongs) return; // Sécurité : ignore si non accessible

  const cookieStore = await cookies();
  cookieStore.set(RESTAURANT_COOKIE, restaurantId, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Retourne l'ID du restaurant sélectionné depuis le cookie.
 * Null si aucun cookie ou cookie invalide.
 */
export async function getSelectedRestaurantId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(RESTAURANT_COOKIE)?.value ?? null;
}
