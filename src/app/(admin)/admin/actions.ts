"use server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { users, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { sendWelcomeEmail, sendResetPasswordEmail } from "@/lib/mail";
import { z } from "zod";
import { cookies } from "next/headers";
import { DEFAULT_STATUS_SETTINGS } from "@/features/kitchen-status/constants";
import { randomBytes } from "node:crypto";
import { logger } from "@/lib/logger";

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
});

const updateRestaurantBillingSchema = z.object({
  stripeCustomerId: z.string().max(100).optional().nullable(),
  billingStartDate: z.string().optional().nullable(),
});

const updateHubriseConfigSchema = z.object({
  hubriseLocationId: z.string().max(100).optional().nullable(),
  hubriseAccessToken: z.string().max(500).optional().nullable(),
});

export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};


function generateSecureString(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(bytes[i] % chars.length);
  }
  return result;
}

function generateTempPassword(): string {
  return generateSecureString(12);
}

function generateResetToken(): string {
  return generateSecureString(32);
}

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }
  return session;
}

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

    await db.insert(users).values({
      email,
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      role,
      mustChangePassword: true,
    });

    try {
      await sendWelcomeEmail(email, tempPassword);
    } catch (emailError) {
      logger.error("Erreur envoi email (utilisateur créé)", emailError instanceof Error ? emailError : new Error(String(emailError)));
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error("Erreur création utilisateur", error instanceof Error ? error : new Error(String(error)));
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

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
    await sendWelcomeEmail(user.email, tempPassword);

    return { success: true };
  } catch (error) {
    logger.error("Erreur renvoi email", error instanceof Error ? error : new Error(String(error)));
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
    logger.error("Erreur mise à jour utilisateur", error instanceof Error ? error : new Error(String(error)));
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

    if (user.mustChangePassword) {
      return { success: false, error: "Cet utilisateur doit d'abord changer son mot de passe initial" };
    }

    const resetToken = generateResetToken();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

    await db
      .update(users)
      .set({
        resetToken,
        resetTokenExpires,
      })
      .where(eq(users.id, userId));

    await sendResetPasswordEmail(user.email, resetToken);

    return { success: true };
  } catch (error) {
    logger.error("Erreur envoi email réinitialisation", error instanceof Error ? error : new Error(String(error)));
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
    logger.error("Erreur suppression utilisateur", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

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

    await db.insert(restaurants).values({
      name,
      phoneNumber,
      ownerId,
      address: address || null,
      status: "onboarding",
      statusSettings: DEFAULT_STATUS_SETTINGS,
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error("Erreur création restaurant", error instanceof Error ? error : new Error(String(error)));
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

    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.address !== undefined) updateData.address = parsed.data.address;
    if (parsed.data.ownerId !== undefined) updateData.ownerId = parsed.data.ownerId;
    if (parsed.data.status !== undefined) {
      updateData.status = parsed.data.status;
      updateData.isActive = parsed.data.status === "active";
    }

    await db.update(restaurants).set(updateData).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    revalidatePath(`/admin/restaurants/${id}`);
    return { success: true };
  } catch (error) {
    logger.error("Erreur mise à jour restaurant", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function createVapiAssistant(id: string): Promise<ActionResult<{ assistantId: string }>> {
  "use server";

  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id))
      .limit(1);

    if (!restaurant) {
      return { success: false, error: "Restaurant non trouvé" };
    }

    if (restaurant.vapiAssistantId) {
      return { success: false, error: "Un assistant Vapi existe déjà pour ce restaurant" };
    }

    const { createVapiAssistant } = await import("@/lib/services/vapi");
    const assistant = await createVapiAssistant(restaurant);

    await db
      .update(restaurants)
      .set({ vapiAssistantId: assistant.id })
      .where(eq(restaurants.id, id));

    revalidatePath(`/admin/restaurants/${id}`);

    return { success: true, data: { assistantId: assistant.id } };
  } catch (error) {
    logger.error("Erreur création assistant Vapi", error instanceof Error ? error : new Error(String(error)));
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la création de l'assistant",
    };
  }
}

export async function updateVapiAssistant(id: string): Promise<ActionResult> {
  "use server";

  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id))
      .limit(1);

    if (!restaurant) {
      return { success: false, error: "Restaurant non trouvé" };
    }

    if (session.user.role === "OWNER" && restaurant.ownerId !== session.user.id) {
      return { success: false, error: "Non autorisé" };
    }

    if (!restaurant.vapiAssistantId) {
      return { success: false, error: "Aucun assistant Vapi configuré pour ce restaurant" };
    }

    const { updateVapiAssistant } = await import("@/lib/services/vapi");
    await updateVapiAssistant(restaurant.vapiAssistantId, restaurant);

    revalidatePath(`/admin/restaurants/${id}`);
    revalidatePath(`/dashboard`);

    return { success: true };
  } catch (error) {
    logger.error("Erreur mise à jour assistant Vapi", error instanceof Error ? error : new Error(String(error)));
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise à jour de l'assistant",
    };
  }
}

export async function deleteVapiAssistant(id: string): Promise<ActionResult> {
  "use server";

  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id))
      .limit(1);

    if (!restaurant) {
      return { success: false, error: "Restaurant non trouvé" };
    }

    if (session.user.role === "OWNER" && restaurant.ownerId !== session.user.id) {
      return { success: false, error: "Non autorisé" };
    }

    if (!restaurant.vapiAssistantId) {
      return { success: false, error: "Aucun assistant Vapi configuré pour ce restaurant" };
    }

    const { deleteVapiAssistant: deleteAssistant } = await import("@/lib/services/vapi");
    await deleteAssistant(restaurant.vapiAssistantId);

    await db
      .update(restaurants)
      .set({ 
        vapiAssistantId: null,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, id));

    revalidatePath(`/admin/restaurants/${id}`);
    revalidatePath(`/dashboard`);

    return { success: true };
  } catch (error) {
    logger.error("Erreur suppression assistant Vapi", error instanceof Error ? error : new Error(String(error)));
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression de l'assistant",
    };
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
    logger.error("Erreur mise à jour IA restaurant", error instanceof Error ? error : new Error(String(error)));
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

    await db.update(restaurants).set(updateData).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    revalidatePath(`/admin/restaurants/${id}`);
    return { success: true };
  } catch (error) {
    logger.error("Erreur mise à jour téléphonie restaurant", error instanceof Error ? error : new Error(String(error)));
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
      updateData.billingStartDate = parsed.data.billingStartDate;
    }

    await db.update(restaurants).set(updateData).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    revalidatePath(`/admin/restaurants/${id}`);
    return { success: true };
  } catch (error) {
    logger.error("Erreur mise à jour facturation restaurant", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function updateHubriseConfig(
  id: string,
  data: z.infer<typeof updateHubriseConfigSchema>
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id) {
      return { success: false, error: "ID restaurant requis" };
    }

    const parsed = updateHubriseConfigSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données invalides" };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (parsed.data.hubriseLocationId !== undefined) {
      updateData.hubriseLocationId = parsed.data.hubriseLocationId;
    }
    if (parsed.data.hubriseAccessToken !== undefined) {
      updateData.hubriseAccessToken = parsed.data.hubriseAccessToken;
    }

    await db.update(restaurants).set(updateData).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    revalidatePath(`/admin/restaurants/${id}`);
    return { success: true };
  } catch (error) {
    logger.error("Erreur mise à jour configuration HubRise", error instanceof Error ? error : new Error(String(error)));
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
    logger.error("Erreur suppression restaurant", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

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

    const cookieStore = await cookies();
    const session = await auth();
    cookieStore.set("admin_impersonator_id", session!.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
    });

    return { 
      success: true, 
      data: `/dashboard?impersonate=${restaurant.ownerId}` 
    };
  } catch (error) {
    logger.error("Erreur impersonation", error instanceof Error ? error : new Error(String(error)));
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

    cookieStore.delete("admin_impersonator_id");

    return { success: true, data: "/admin" };
  } catch (error) {
    logger.error("Erreur arrêt impersonation", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de l'arrêt de l'impersonation" };
  }
}

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
    logger.error("Erreur toggle statut restaurant", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de la mise à jour du statut" };
  }
}

