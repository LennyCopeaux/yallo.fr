"use server";

import { auth, signIn } from "@/lib/auth/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export type UpdatePasswordResult = {
  success: boolean;
  error?: string;
};

export async function updatePassword(
  formData: FormData
): Promise<UpdatePasswordResult> {
  // 1. Vérifie que l'utilisateur est connecté
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Non autorisé" };
  }

  const userEmail = session.user.email;
  const userRole = session.user.role;

  // 2. Récupère et valide les mots de passe
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || !confirmPassword) {
    return { success: false, error: "Tous les champs sont requis" };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "Le mot de passe doit contenir au moins 6 caractères" };
  }

  // 3. Vérifie que les deux mots de passe correspondent
  if (newPassword !== confirmPassword) {
    return { success: false, error: "Les mots de passe ne correspondent pas" };
  }

  try {
    // 4. Hash le nouveau mot de passe
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 5. Update BDD : Met à jour le password_hash et passe must_change_password à false
    await db
      .update(users)
      .set({
        passwordHash,
        mustChangePassword: false,
      })
      .where(eq(users.id, session.user.id));

    // 6. CRUCIAL - RE-LOGIN SILENCIEUX pour régénérer le JWT
    // Cela force Next-Auth à générer un nouveau Token JWT propre
    // où must_change_password sera false
    try {
      await signIn("credentials", {
        email: userEmail,
        password: newPassword,
        redirect: false,
      });
    } catch (signInError) {
      // Si c'est une erreur d'auth, on log mais on continue
      // car le mot de passe a été mis à jour avec succès
      if (signInError instanceof AuthError) {
        console.error("Erreur re-login silencieux:", signInError);
        // On continue quand même, le user devra se reconnecter manuellement
      } else {
        throw signInError;
      }
    }

    // 7. Redirection finale vers le dashboard approprié
    // Utilise redirect() qui lance une exception NEXT_REDIRECT
    const redirectPath = userRole === "ADMIN" ? "/admin" : "/dashboard";
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

    console.error("Erreur mise à jour mot de passe:", error);
    return { success: false, error: "Erreur lors de la mise à jour du mot de passe" };
  }
}
