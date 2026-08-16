"use server";

import { cookies } from "next/headers";
import { getUserRestaurants, RESTAURANT_COOKIE } from "@/lib/auth";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function switchRestaurant(restaurantId: string): Promise<void> {
  const accessible = await getUserRestaurants();
  const belongs = accessible.some((r) => r.id === restaurantId);
  if (!belongs) return;

  const cookieStore = await cookies();
  cookieStore.set(RESTAURANT_COOKIE, restaurantId, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSelectedRestaurantId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(RESTAURANT_COOKIE)?.value ?? null;
}
