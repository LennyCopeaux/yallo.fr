"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { sendWelcomeEmail } from "@/lib/mail";

// Génère un slug à partir du nom (kebab-case)
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, "") // Supprime les caractères spéciaux
    .replace(/\s+/g, "-") // Remplace les espaces par des tirets
    .replace(/-+/g, "-") // Supprime les tirets multiples
    .trim();
}

// Génère un mot de passe temporaire sécurisé
function generateTempPassword(): string {
  // Génère une string aléatoire de 12 caractères avec lettres et chiffres
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export type ActionResult = {
  success: boolean;
  error?: string;
};

// ============================================
// USERS - CREATE (Invitation avec mot de passe temporaire)
// ============================================
export async function createUser(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" };
  }

  const email = formData.get("email") as string;
  const role = formData.get("role") as "ADMIN" | "OWNER";

  if (!email || !role) {
    return { success: false, error: "Email et rôle sont requis" };
  }

  if (!["ADMIN", "OWNER"].includes(role)) {
    return { success: false, error: "Rôle invalide" };
  }

  // Validation email basique
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Email invalide" };
  }

  try {
    // Génère un mot de passe temporaire sécurisé
    const tempPassword = generateTempPassword();

    // Envoie l'email AVANT de créer l'utilisateur
    // Si l'email échoue, on ne crée pas l'utilisateur
    await sendWelcomeEmail(email, tempPassword);

    // Hash le mot de passe temporaire
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Crée l'utilisateur avec must_change_password = true
    await db.insert(users).values({
      email,
      passwordHash,
      role,
      mustChangePassword: true,
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erreur création utilisateur:", error);
    if (error instanceof Error) {
      if (error.message.includes("users_email_unique")) {
        return { success: false, error: "Cet email est déjà utilisé" };
      }
      if (error.message.includes("email")) {
        return { success: false, error: "Erreur lors de l'envoi de l'email. Veuillez vérifier votre configuration Resend." };
      }
    }
    return { success: false, error: "Erreur lors de la création" };
  }
}

// ============================================
// USERS - UPDATE
// ============================================
export async function updateUser(
  id: string,
  data: { email?: string; role?: "ADMIN" | "OWNER" }
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" };
  }

  if (!id) {
    return { success: false, error: "ID utilisateur requis" };
  }

  try {
    const updateData: { email?: string; role?: "ADMIN" | "OWNER" } = {};
    
    if (data.email) updateData.email = data.email;
    if (data.role && ["ADMIN", "OWNER"].includes(data.role)) {
      updateData.role = data.role;
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: "Aucune donnée à mettre à jour" };
    }

    await db.update(users).set(updateData).where(eq(users.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erreur mise à jour utilisateur:", error);
    if (error instanceof Error && error.message.includes("users_email_unique")) {
      return { success: false, error: "Cet email est déjà utilisé" };
    }
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

// ============================================
// USERS - DELETE
// ============================================
export async function deleteUser(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" };
  }

  if (!id) {
    return { success: false, error: "ID utilisateur requis" };
  }

  // Empêcher l'auto-suppression
  if (session.user.id === id) {
    return { success: false, error: "Vous ne pouvez pas vous supprimer vous-même" };
  }

  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// ============================================
// RESTAURANTS - CREATE
// ============================================
export async function createRestaurant(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" };
  }

  const name = formData.get("name") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const ownerId = formData.get("ownerId") as string;

  if (!name || !phoneNumber || !ownerId) {
    return { success: false, error: "Tous les champs sont requis" };
  }

  try {
    const slug = generateSlug(name);
    await db.insert(restaurants).values({ name, slug, phoneNumber, ownerId });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erreur création restaurant:", error);
    if (error instanceof Error && error.message.includes("restaurants_slug_unique")) {
      return { success: false, error: "Un restaurant avec ce nom existe déjà" };
    }
    return { success: false, error: "Erreur lors de la création" };
  }
}

// ============================================
// RESTAURANTS - UPDATE
// ============================================
export async function updateRestaurant(
  id: string,
  data: { name?: string; phoneNumber?: string; ownerId?: string }
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" };
  }

  if (!id) {
    return { success: false, error: "ID restaurant requis" };
  }

  try {
    const updateData: { name?: string; slug?: string; phoneNumber?: string; ownerId?: string } = {};
    
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = generateSlug(data.name);
    }
    if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
    if (data.ownerId) updateData.ownerId = data.ownerId;

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: "Aucune donnée à mettre à jour" };
    }

    await db.update(restaurants).set(updateData).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erreur mise à jour restaurant:", error);
    if (error instanceof Error && error.message.includes("restaurants_slug_unique")) {
      return { success: false, error: "Un restaurant avec ce nom existe déjà" };
    }
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

// ============================================
// RESTAURANTS - DELETE
// ============================================
export async function deleteRestaurant(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" };
  }

  if (!id) {
    return { success: false, error: "ID restaurant requis" };
  }

  try {
    await db.delete(restaurants).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression restaurant:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// ============================================
// RESTAURANTS - TOGGLE STATUS
// ============================================
export async function toggleRestaurantStatus(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" };
  }

  if (!id) {
    return { success: false, error: "ID restaurant requis" };
  }

  try {
    await db
      .update(restaurants)
      .set({ isActive })
      .where(eq(restaurants.id, id));

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erreur toggle statut restaurant:", error);
    return { success: false, error: "Erreur lors de la mise à jour du statut" };
  }
}

// ============================================
// LEGACY - Créer Restaurant + Owner en même temps
// ============================================
export async function createRestaurantAndOwner(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" };
  }

  const restaurantName = formData.get("restaurantName") as string;
  const ownerEmail = formData.get("ownerEmail") as string;
  const ownerPassword = formData.get("ownerPassword") as string;
  const phoneNumber = formData.get("phoneNumber") as string;

  if (!restaurantName || !ownerEmail || !ownerPassword || !phoneNumber) {
    return { success: false, error: "Tous les champs sont requis" };
  }

  if (ownerPassword.length < 6) {
    return { success: false, error: "Le mot de passe doit contenir au moins 6 caractères" };
  }

  try {
    const passwordHash = await bcrypt.hash(ownerPassword, 10);
    const slug = generateSlug(restaurantName);

    const [newUser] = await db
      .insert(users)
      .values({ email: ownerEmail, passwordHash, role: "OWNER" })
      .returning();

    if (!newUser) {
      return { success: false, error: "Erreur lors de la création de l'utilisateur" };
    }

    await db.insert(restaurants).values({
      name: restaurantName,
      slug,
      phoneNumber,
      ownerId: newUser.id,
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erreur création restaurant:", error);
    if (error instanceof Error) {
      if (error.message.includes("users_email_unique")) {
        return { success: false, error: "Cet email est déjà utilisé" };
      }
      if (error.message.includes("restaurants_slug_unique")) {
        return { success: false, error: "Un restaurant avec ce nom existe déjà" };
      }
    }
    return { success: false, error: "Erreur lors de la création" };
  }
}
