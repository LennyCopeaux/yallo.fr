"use server";

import { auth, signIn } from "@/lib/auth/auth";
import { db } from "@/db";
import { users, restaurants, RestaurantStatus, RestaurantPlan } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { sendWelcomeEmail, sendResetPasswordEmail } from "@/lib/mail";
import { z } from "zod";
import { cookies } from "next/headers";

// ============================================
// SCHEMAS ZOD
// ============================================

const createUserSchema = z.object({
  email: z.string().email("Email invalide"),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  role: z.enum(["ADMIN", "OWNER"]),
});

const updateUserSchema = z.object({
  email: z.string().email("Email invalide").optional(),
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  role: z.enum(["ADMIN", "OWNER"]).optional(),
});

const createRestaurantSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100, "Nom trop long"),
  phoneNumber: z.string().min(10, "Numéro invalide"),
  ownerId: z.string().uuid("ID propriétaire invalide"),
  address: z.string().optional(),
});

const updateRestaurantGeneralSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100, "Nom trop long").optional(),
  slug: z.string().min(2, "Slug trop court").max(50, "Slug trop long").optional(),
  address: z.string().max(500, "Adresse trop longue").optional().nullable(),
  ownerId: z.string().uuid("ID propriétaire invalide").optional(),
  status: z.enum(["active", "suspended", "onboarding"]).optional(),
});

const updateRestaurantAISchema = z.object({
  vapiAssistantId: z.string().max(100).optional().nullable(),
  systemPrompt: z.string().max(10000, "Prompt trop long").optional().nullable(),
  menuContext: z.string().max(50000, "Menu trop long").optional().nullable(),
});

const updateRestaurantTelephonySchema = z.object({
  phoneNumber: z.string().min(10, "Numéro invalide").optional(),
  twilioPhoneNumber: z.string().max(20).optional().nullable(),
  businessHours: z.string().max(5000).optional().nullable(),
});

const updateRestaurantBillingSchema = z.object({
  stripeCustomerId: z.string().max(100).optional().nullable(),
  billingStartDate: z.string().optional().nullable(),
});

// Type de retour standardisé
export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

// ============================================
// UTILS
// ============================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateResetToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }
  return session;
}

// ============================================
// USERS - CRUD
// ============================================

export async function createUser(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    
    const parsed = createUserSchema.safeParse({
      email: formData.get("email"),
      firstName: formData.get("firstName") || undefined,
      lastName: formData.get("lastName") || undefined,
      role: formData.get("role"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données invalides" };
    }

    const { email, firstName, lastName, role } = parsed.data;

    // Vérifier si l'utilisateur existe AVANT d'envoyer l'email
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: "Cet email est déjà utilisé" };
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Créer l'utilisateur d'abord
    await db.insert(users).values({
      email,
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      role,
      mustChangePassword: true,
    });

    // Envoyer l'email APRÈS la création réussie
    try {
      await sendWelcomeEmail(email, tempPassword);
    } catch (emailError) {
      console.error("Erreur envoi email (utilisateur créé):", emailError);
      // L'utilisateur est créé, on continue mais on log l'erreur
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erreur création utilisateur:", error);
    if (error instanceof Error) {
      if (error.message.includes("users_email_unique")) {
        return { success: false, error: "Cet email est déjà utilisé" };
      }
    }
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function resendWelcomeEmail(userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!userId) {
      return { success: false, error: "ID utilisateur requis" };
    }

    // Récupérer l'utilisateur
    const [user] = await db
      .select({ email: users.email, mustChangePassword: users.mustChangePassword })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "Utilisateur non trouvé" };
    }

    // Ne renvoyer que si l'utilisateur doit encore changer son mot de passe
    if (!user.mustChangePassword) {
      return { success: false, error: "Cet utilisateur a déjà changé son mot de passe" };
    }

    // Générer un nouveau mot de passe temporaire
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Mettre à jour le mot de passe
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));

    // Envoyer l'email
    await sendWelcomeEmail(user.email, tempPassword);

    return { success: true };
  } catch (error) {
    console.error("Erreur renvoi email:", error);
    return { success: false, error: "Erreur lors du renvoi de l'email" };
  }
}

export async function updateUser(
  id: string,
  data: z.infer<typeof updateUserSchema>
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id) {
      return { success: false, error: "ID utilisateur requis" };
    }

    const parsed = updateUserSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données invalides" };
    }

    const updateData: Partial<{ email: string; firstName: string | null; lastName: string | null; role: "ADMIN" | "OWNER" }> = {};
    if (parsed.data.email !== undefined) updateData.email = parsed.data.email;
    if (parsed.data.firstName !== undefined) updateData.firstName = parsed.data.firstName;
    if (parsed.data.lastName !== undefined) updateData.lastName = parsed.data.lastName;
    if (parsed.data.role !== undefined) updateData.role = parsed.data.role;

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

export async function sendPasswordResetEmail(userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!userId) {
      return { success: false, error: "ID utilisateur requis" };
    }

    // Récupérer l'utilisateur
    const [user] = await db
      .select({ 
        email: users.email, 
        mustChangePassword: users.mustChangePassword 
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "Utilisateur non trouvé" };
    }

    // Ne peut envoyer que si l'utilisateur a déjà changé son mot de passe initial
    if (user.mustChangePassword) {
      return { success: false, error: "Cet utilisateur doit d'abord changer son mot de passe initial" };
    }

    // Générer un token de réinitialisation (valide 1 heure)
    const resetToken = generateResetToken();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

    // Stocker le token dans la base de données
    await db
      .update(users)
      .set({
        resetToken,
        resetTokenExpires,
      })
      .where(eq(users.id, userId));

    // Envoyer l'email
    await sendResetPasswordEmail(user.email, resetToken);

    return { success: true };
  } catch (error) {
    console.error("Erreur envoi email réinitialisation:", error);
    return { success: false, error: "Erreur lors de l'envoi de l'email" };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    if (!id) {
      return { success: false, error: "ID utilisateur requis" };
    }

    if (session.user.id === id) {
      return { success: false, error: "Vous ne pouvez pas vous supprimer vous-même" };
    }

    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// ============================================
// RESTAURANTS - CRUD
// ============================================

export async function createRestaurant(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = createRestaurantSchema.safeParse({
      name: formData.get("name"),
      phoneNumber: formData.get("phoneNumber"),
      ownerId: formData.get("ownerId"),
      address: formData.get("address") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données invalides" };
    }

    const { name, phoneNumber, ownerId, address } = parsed.data;
    const slug = generateSlug(name);

    await db.insert(restaurants).values({
      name,
      slug,
      phoneNumber,
      ownerId,
      address: address || null,
      status: "onboarding",
    });

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

export async function updateRestaurantGeneral(
  id: string,
  data: z.infer<typeof updateRestaurantGeneralSchema>
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id) {
      return { success: false, error: "ID restaurant requis" };
    }

    const parsed = updateRestaurantGeneralSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données invalides" };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (parsed.data.name !== undefined) {
      updateData.name = parsed.data.name;
      // Génère un nouveau slug si pas de slug personnalisé fourni
      if (!parsed.data.slug) {
        updateData.slug = generateSlug(parsed.data.name);
      }
    }
    if (parsed.data.slug !== undefined) updateData.slug = parsed.data.slug;
    if (parsed.data.address !== undefined) updateData.address = parsed.data.address;
    if (parsed.data.ownerId !== undefined) updateData.ownerId = parsed.data.ownerId;
    if (parsed.data.status !== undefined) {
      updateData.status = parsed.data.status as RestaurantStatus;
      // Sync isActive avec status
      updateData.isActive = parsed.data.status === "active";
    }

    await db.update(restaurants).set(updateData).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    revalidatePath(`/admin/restaurants/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur mise à jour restaurant:", error);
    if (error instanceof Error && error.message.includes("restaurants_slug_unique")) {
      return { success: false, error: "Un restaurant avec ce slug existe déjà" };
    }
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function updateRestaurantAI(
  id: string,
  data: z.infer<typeof updateRestaurantAISchema>
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id) {
      return { success: false, error: "ID restaurant requis" };
    }

    const parsed = updateRestaurantAISchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données invalides" };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (parsed.data.vapiAssistantId !== undefined) updateData.vapiAssistantId = parsed.data.vapiAssistantId;
    if (parsed.data.systemPrompt !== undefined) updateData.systemPrompt = parsed.data.systemPrompt;
    if (parsed.data.menuContext !== undefined) updateData.menuContext = parsed.data.menuContext;

    await db.update(restaurants).set(updateData).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    revalidatePath(`/admin/restaurants/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur mise à jour IA restaurant:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function updateRestaurantTelephony(
  id: string,
  data: z.infer<typeof updateRestaurantTelephonySchema>
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id) {
      return { success: false, error: "ID restaurant requis" };
    }

    const parsed = updateRestaurantTelephonySchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données invalides" };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (parsed.data.phoneNumber !== undefined) updateData.phoneNumber = parsed.data.phoneNumber;
    if (parsed.data.twilioPhoneNumber !== undefined) updateData.twilioPhoneNumber = parsed.data.twilioPhoneNumber;
    if (parsed.data.businessHours !== undefined) updateData.businessHours = parsed.data.businessHours;

    await db.update(restaurants).set(updateData).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    revalidatePath(`/admin/restaurants/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur mise à jour téléphonie restaurant:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function updateRestaurantBilling(
  id: string,
  data: z.infer<typeof updateRestaurantBillingSchema>
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id) {
      return { success: false, error: "ID restaurant requis" };
    }

    const parsed = updateRestaurantBillingSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données invalides" };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (parsed.data.stripeCustomerId !== undefined) updateData.stripeCustomerId = parsed.data.stripeCustomerId;
    if (parsed.data.billingStartDate !== undefined) {
      // Stocke la date au format ISO string dans un champ texte
      // Note: Si vous avez un champ billingStartDate dans le schéma, utilisez-le directement
      // Sinon, on peut utiliser un champ existant ou créer une migration
      updateData.billingStartDate = parsed.data.billingStartDate;
    }

    await db.update(restaurants).set(updateData).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    revalidatePath(`/admin/restaurants/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur mise à jour facturation restaurant:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteRestaurant(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id) {
      return { success: false, error: "ID restaurant requis" };
    }

    await db.delete(restaurants).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression restaurant:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// ============================================
// IMPERSONATION - Se connecter en tant que
// ============================================

export async function impersonateRestaurant(restaurantId: string): Promise<ActionResult<string>> {
  try {
    await requireAdmin();

    if (!restaurantId) {
      return { success: false, error: "ID restaurant requis" };
    }

    // Récupère le restaurant et son owner
    const [restaurant] = await db
      .select({
        id: restaurants.id,
        ownerId: restaurants.ownerId,
        ownerEmail: users.email,
      })
      .from(restaurants)
      .innerJoin(users, eq(restaurants.ownerId, users.id))
      .where(eq(restaurants.id, restaurantId))
      .limit(1);

    if (!restaurant) {
      return { success: false, error: "Restaurant non trouvé" };
    }

    // Stocke l'ID admin dans un cookie pour permettre le retour
    const cookieStore = await cookies();
    const session = await auth();
    cookieStore.set("admin_impersonator_id", session!.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 heure
    });

    // Retourne l'URL de redirection vers le dashboard
    return { 
      success: true, 
      data: `/dashboard?impersonate=${restaurant.ownerId}` 
    };
  } catch (error) {
    console.error("Erreur impersonation:", error);
    return { success: false, error: "Erreur lors de l'impersonation" };
  }
}

export async function stopImpersonation(): Promise<ActionResult<string>> {
  try {
    const cookieStore = await cookies();
    const impersonatorId = cookieStore.get("admin_impersonator_id")?.value;

    if (!impersonatorId) {
      return { success: false, error: "Pas d'impersonation active" };
    }

    // Supprime le cookie
    cookieStore.delete("admin_impersonator_id");

    return { success: true, data: "/admin" };
  } catch (error) {
    console.error("Erreur arrêt impersonation:", error);
    return { success: false, error: "Erreur lors de l'arrêt de l'impersonation" };
  }
}

// ============================================
// LEGACY - Toggle status (pour compatibilité)
// ============================================

export async function toggleRestaurantStatus(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id) {
      return { success: false, error: "ID restaurant requis" };
    }

    await db
      .update(restaurants)
      .set({ 
        isActive,
        status: isActive ? "active" : "suspended",
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, id));

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erreur toggle statut restaurant:", error);
    return { success: false, error: "Erreur lors de la mise à jour du statut" };
  }
}

