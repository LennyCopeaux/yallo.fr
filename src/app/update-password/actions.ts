"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export type UpdatePasswordResult = {
  success: boolean;
  error?: string;
};

function validatePasswords(newPassword: string, confirmPassword: string): { valid: true } | { valid: false; error: string } {
  if (!newPassword || !confirmPassword) {
    return { valid: false, error: "Tous les champs sont requis" };
  }
  if (newPassword.length < 6) {
    return { valid: false, error: "Le mot de passe doit contenir au moins 6 caractères" };
  }
  if (newPassword !== confirmPassword) {
    return { valid: false, error: "Les mots de passe ne correspondent pas" };
  }
  return { valid: true };
}

export async function updatePassword(
  formData: FormData
): Promise<UpdatePasswordResult> {
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validation = validatePasswords(newPassword, confirmPassword);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { must_change_password: false },
    });

    if (error) {
      logger.error("Erreur mise à jour mot de passe Supabase", error);
      return { success: false, error: "Erreur lors de la mise à jour du mot de passe" };
    }

    const user = await getAppUser();
    const redirectPath = user?.role === "ADMIN" ? "/admin" : "/dashboard";
    redirect(redirectPath);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    logger.error("Erreur mise à jour mot de passe", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de la mise à jour du mot de passe" };
  }
}
