"use server";

import { db } from "@/db";
import { roles, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type { SelectRole } from "@/db/schema";

const SYSTEM_ROLE_NAMES = ["ADMIN", "OWNER", "EMPLOYEE"] as const;

const roleSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(50, "50 caractères max"),
  description: z.string().trim().max(300, "300 caractères max").nullable().optional(),
});

export async function getRoles() {
  await requireAdmin();
  return db.select().from(roles).orderBy(roles.createdAt);
}

export async function createRole(
  input: z.infer<typeof roleSchema>
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await db.insert(roles).values({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    });
    revalidatePath("/admin/roles");
    return { success: true };
  } catch {
    return { success: false, error: "Ce nom de rôle est déjà utilisé" };
  }
}

export async function updateRole(
  id: string,
  input: z.infer<typeof roleSchema>
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const [existing] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!existing) return { success: false, error: "Rôle introuvable" };
  if ((SYSTEM_ROLE_NAMES as readonly string[]).includes(existing.name)) {
    return { success: false, error: "Les rôles système ne peuvent pas être modifiés" };
  }

  try {
    await db
      .update(roles)
      .set({
        name: parsed.data.name,
        description: parsed.data.description ?? null,
      })
      .where(eq(roles.id, id));
    revalidatePath("/admin/roles");
    return { success: true };
  } catch {
    return { success: false, error: "Ce nom de rôle est déjà utilisé" };
  }
}

export async function deleteRole(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const [existing] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!existing) return { success: false, error: "Rôle introuvable" };

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(sql`role::text = ${existing.name}`);

  if (count > 0) {
    return {
      success: false,
      error: `Impossible : ${count} utilisateur${count > 1 ? "s ont" : " a"} ce rôle.`,
    };
  }

  if ((SYSTEM_ROLE_NAMES as readonly string[]).includes(existing.name)) {
    return { success: false, error: "Les rôles système ne peuvent pas être supprimés" };
  }

  await db.delete(roles).where(eq(roles.id, id));
  revalidatePath("/admin/roles");
  return { success: true };
}

