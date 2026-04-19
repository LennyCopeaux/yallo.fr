import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users, type UserRole } from "@/db/schema";
import { eq } from "drizzle-orm";

export type AppUser = typeof users.$inferSelect;

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getAppUser(): Promise<AppUser | null> {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const [appUser] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authUser.id))
    .limit(1);

  return appUser ?? null;
}

export async function requireAuth(): Promise<AppUser> {
  const user = await getAppUser();
  if (!user) throw new Error("Non autorisé");
  return user;
}

export async function requireAdmin(): Promise<AppUser> {
  const user = await getAppUser();
  if (!user || user.role !== "ADMIN") throw new Error("Non autorisé");
  return user;
}

export async function requireRole(role: UserRole): Promise<AppUser> {
  const user = await getAppUser();
  if (!user || user.role !== role) throw new Error("Non autorisé");
  return user;
}
