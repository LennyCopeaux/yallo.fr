"use server";

import { auth, signIn } from "@/lib/auth/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { logger } from "@/lib/logger";

export type UpdatePasswordResult = {
  success: boolean;
  error?: string;
};

type ResolvedUser = { email: string; role: string; id: string };

async function resolveUser(resetToken: string | null): Promise<{ success: true; user: ResolvedUser } | { success: false; error: string }> {
  if (resetToken) {
    const tokenVerification = await verifyResetToken(resetToken);
    if (!tokenVerification.valid || !tokenVerification.email) {
      return { success: false, error: tokenVerification.error || "Token invalide" };
    }

    const [user] = await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.resetToken, resetToken))
      .limit(1);

    if (!user) {
      return { success: false, error: "Utilisateur non trouvé" };
    }

    return { success: true, user: { email: user.email, role: user.role, id: user.id } };
  }

  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  return {
    success: true,
    user: {
      email: session.user.email ?? "",
      role: session.user.role,
      id: session.user.id,
    },
  };
}

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

export async function verifyResetToken(token: string): Promise<{ valid: boolean; email?: string; error?: string }> {
  if (!token) {
    return { valid: false, error: "Token manquant" };
  }

  try {
    const [user] = await db
      .select({
        email: users.email,
        resetToken: users.resetToken,
        resetTokenExpires: users.resetTokenExpires,
      })
      .from(users)
      .where(eq(users.resetToken, token))
      .limit(1);

    if (!user?.resetToken) {
      return { valid: false, error: "Token invalide" };
    }

    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return { valid: false, error: "Token expiré. Veuillez demander un nouveau lien de réinitialisation." };
    }

    return { valid: true, email: user.email };
  } catch (error) {
    logger.error("Erreur vérification token réinitialisation", error instanceof Error ? error : new Error(String(error)));
    return { valid: false, error: "Erreur lors de la vérification du token" };
  }
}

export async function updatePassword(
  formData: FormData
): Promise<UpdatePasswordResult> {
  const resetToken = formData.get("token") as string | null;
  const userResult = await resolveUser(resetToken);
  if (!userResult.success) {
    return { success: false, error: userResult.error };
  }

  const { user } = userResult;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validation = validatePasswords(newPassword, confirmPassword);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    // 4. Hash le nouveau mot de passe
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 5. Update BDD : Met à jour le password_hash et passe must_change_password à false
    const updateData: Record<string, unknown> = {
      passwordHash,
      mustChangePassword: false,
    };

    if (resetToken) {
      updateData.resetToken = null;
      updateData.resetTokenExpires = null;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id));

    // 6. CRUCIAL - RE-LOGIN SILENCIEUX pour régénérer le JWT
    // Cela force Next-Auth à générer un nouveau Token JWT propre
    // où must_change_password sera false
    try {
      await signIn("credentials", {
        email: user.email,
        password: newPassword,
        redirect: false,
      });
    } catch (signInError) {
      // Si c'est une erreur d'auth, on log mais on continue
      // car le mot de passe a été mis à jour avec succès
      if (signInError instanceof AuthError) {
        logger.error("Erreur re-login silencieux", signInError);
        // On continue quand même, le user devra se reconnecter manuellement
      } else {
        throw signInError;
      }
    }

    // 7. Redirection finale vers le dashboard approprié
    // Utilise redirect() qui lance une exception NEXT_REDIRECT
    const redirectPath = user.role === "ADMIN" ? "/admin" : "/dashboard";
    redirect(redirectPath);
    
  } catch (error) {
    // Si c'est une redirection Next.js, on la laisse passer
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
