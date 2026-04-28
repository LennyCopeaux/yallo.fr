"use server";

import { randomBytes } from "node:crypto";
import { requireAdmin, getAppUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { DEFAULT_STATUS_SETTINGS } from "@/features/kitchen-status/constants";
import { logger } from "@/lib/logger";
import { normalizeFrenchPhoneNumber } from "@/lib/utils";
import { sendWelcomeEmail } from "@/lib/mail";

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  role: z.enum(["ADMIN", "OWNER"]),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
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
  systemPrompt: z.string().max(10000, "Prompt trop long").optional().nullable(),
  menuContext: z.string().max(50000, "Menu trop long").optional().nullable(),
});

const updateRestaurantTelephonySchema = z.object({
  phoneNumber: z.string().min(10, "Numéro invalide").optional(),
  twilioPhoneNumber: z
    .string()
    .max(20)
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null;
      const normalized = normalizeFrenchPhoneNumber(val);
      if (!normalized) {
        throw new z.ZodError([
          {
            code: "custom",
            path: ["twilioPhoneNumber"],
            message:
              "Format invalide. Utilisez le format +33XXXXXXXXX (ex: +33939035299) ou 0XXXXXXXXX (ex: 0939035299)",
          },
        ]);
      }
      return normalized;
    }),
});

const updateRestaurantBillingSchema = z.object({
  stripeCustomerId: z.string().max(100).optional().nullable(),
  billingStartDate: z.string().optional().nullable(),
});

const updateHubriseConfigSchema = z.object({
  hubriseLocationId: z.string().max(100).optional().nullable(),
  hubriseAccessToken: z.string().max(500).optional().nullable(),
  hubriseCatalogId: z.string().max(50).optional().nullable(),
});

export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

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

    // Génère un mot de passe temporaire sécurisé
    const tempPassword = randomBytes(12).toString("hex") + "Aa1!";

    const supabaseAdmin = await createAdminClient();
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        firstName: firstName || null,
        lastName: lastName || null,
        role,
        must_change_password: true,
      },
    });

    if (authError || !authData.user) {
      logger.error("Supabase createUser failed", authError ?? new Error("No user returned"));
      return { success: false, error: authError?.message || "Erreur création compte auth" };
    }

    await db.insert(users).values({
      authUserId: authData.user.id,
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      role,
    });

    // Envoi de l'email de bienvenue avec le mot de passe temporaire
    try {
      await sendWelcomeEmail(email, tempPassword);
    } catch (mailError) {
      logger.error(
        "Erreur envoi email de bienvenue",
        mailError instanceof Error ? mailError : new Error(String(mailError))
      );
      // On ne bloque pas la création si l'email échoue
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error(
      "Erreur création utilisateur",
      error instanceof Error ? error : new Error(String(error))
    );
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

    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "Utilisateur non trouvé" };
    }

    const supabaseAdmin = await createAdminClient();
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: user.email,
    });

    if (error) {
      logger.error("Erreur génération lien magique", error);
      return { success: false, error: "Erreur lors du renvoi de l'email" };
    }

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

    const updateData: Partial<{
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: "ADMIN" | "OWNER";
    }> = {};
    if (parsed.data.email !== undefined) updateData.email = parsed.data.email;
    if (parsed.data.firstName !== undefined) updateData.firstName = parsed.data.firstName;
    if (parsed.data.lastName !== undefined) updateData.lastName = parsed.data.lastName;
    if (parsed.data.role !== undefined) updateData.role = parsed.data.role;

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: "Aucune donnée à mettre à jour" };
    }

    // If email changes, also update in Supabase Auth
    if (updateData.email) {
      const [targetUser] = await db
        .select({ authUserId: users.authUserId })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (targetUser?.authUserId) {
        const supabaseAdmin = await createAdminClient();
        await supabaseAdmin.auth.admin.updateUserById(targetUser.authUserId, {
          email: updateData.email,
        });
      }
    }

    await db.update(users).set(updateData).where(eq(users.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error(
      "Erreur mise à jour utilisateur",
      error instanceof Error ? error : new Error(String(error))
    );
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
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "Utilisateur non trouvé" };
    }

    const supabaseAdmin = await createAdminClient();
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: user.email,
    });

    if (error) {
      logger.error("Erreur génération lien reset", error);
      return { success: false, error: "Erreur lors de l'envoi de l'email" };
    }

    return { success: true };
  } catch (error) {
    logger.error(
      "Erreur envoi email réinitialisation",
      error instanceof Error ? error : new Error(String(error))
    );
    return { success: false, error: "Erreur lors de l'envoi de l'email" };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    if (!id) {
      return { success: false, error: "ID utilisateur requis" };
    }

    if (admin.id === id) {
      return { success: false, error: "Vous ne pouvez pas vous supprimer vous-même" };
    }

    // Also delete from Supabase Auth
    const [targetUser] = await db
      .select({ authUserId: users.authUserId })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (targetUser?.authUserId) {
      const supabaseAdmin = await createAdminClient();
      await supabaseAdmin.auth.admin.deleteUser(targetUser.authUserId);
    }

    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error(
      "Erreur suppression utilisateur",
      error instanceof Error ? error : new Error(String(error))
    );
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
    logger.error(
      "Erreur création restaurant",
      error instanceof Error ? error : new Error(String(error))
    );
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
    logger.error(
      "Erreur mise à jour restaurant",
      error instanceof Error ? error : new Error(String(error))
    );
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function createElevenLabsAgent(
  id: string
): Promise<ActionResult<{ agentId: string }>> {
  "use server";

  const user = await getAppUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);

    if (!restaurant) {
      return { success: false, error: "Restaurant non trouvé" };
    }

    if (user.role === "OWNER" && restaurant.ownerId !== user.id) {
      return { success: false, error: "Non autorisé" };
    }

    if (restaurant.elevenLabsAgentId) {
      return { success: false, error: "Un agent ElevenLabs existe déjà pour ce restaurant" };
    }

    if (!restaurant.twilioPhoneNumber) {
      return {
        success: false,
        error:
          "Veuillez d'abord renseigner le numéro Twilio dans l'onglet Téléphonie avant de créer l'agent IA",
      };
    }

    const { createElevenLabsAgent: createAgent, importTwilioPhoneNumber } =
      await import("@/lib/services/elevenlabs-agent");

    const agent = await createAgent(restaurant);

    let elevenLabsPhoneNumberId: string | null = null;
    try {
      const phoneResult = await importTwilioPhoneNumber(
        restaurant.twilioPhoneNumber,
        agent.agent_id
      );
      elevenLabsPhoneNumberId = phoneResult.phone_number_id;
      logger.info("Numéro Twilio importé et lié à l'agent ElevenLabs", {
        restaurantId: id,
        agentId: agent.agent_id,
        phoneNumberId: phoneResult.phone_number_id,
        phoneNumber: restaurant.twilioPhoneNumber,
      });
    } catch (phoneError) {
      const { deleteElevenLabsAgent: cleanupAgent } =
        await import("@/lib/services/elevenlabs-agent");
      try {
        await cleanupAgent(agent.agent_id);
      } catch {
        // Ignore
      }
      const errorMessage = phoneError instanceof Error ? phoneError.message : String(phoneError);
      logger.error(
        "Échec import numéro Twilio dans ElevenLabs, agent supprimé",
        new Error(errorMessage)
      );
      return {
        success: false,
        error: `Impossible d'importer le numéro Twilio (${restaurant.twilioPhoneNumber}) dans ElevenLabs : ${errorMessage}. Vérifiez que le numéro est bien actif sur Twilio et que les identifiants Twilio sont corrects.`,
      };
    }

    await db
      .update(restaurants)
      .set({
        elevenLabsAgentId: agent.agent_id,
        elevenLabsPhoneNumberId,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, id));

    revalidatePath(`/admin/restaurants/${id}`);

    return { success: true, data: { agentId: agent.agent_id } };
  } catch (error) {
    logger.error(
      "Erreur création agent ElevenLabs",
      error instanceof Error ? error : new Error(String(error))
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la création de l'agent",
    };
  }
}

export async function updateElevenLabsAgent(id: string): Promise<ActionResult> {
  "use server";

  const user = await getAppUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);

    if (!restaurant) {
      return { success: false, error: "Restaurant non trouvé" };
    }

    if (user.role === "OWNER" && restaurant.ownerId !== user.id) {
      return { success: false, error: "Non autorisé" };
    }

    if (!restaurant.elevenLabsAgentId) {
      return { success: false, error: "Aucun agent ElevenLabs configuré pour ce restaurant" };
    }

    const { updateElevenLabsAgent: patchAgent } = await import("@/lib/services/elevenlabs-agent");
    await patchAgent(restaurant.elevenLabsAgentId, restaurant);

    revalidatePath(`/admin/restaurants/${id}`);
    revalidatePath(`/dashboard`);

    return { success: true };
  } catch (error) {
    logger.error(
      "Erreur mise à jour agent ElevenLabs",
      error instanceof Error ? error : new Error(String(error))
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise à jour de l'agent",
    };
  }
}

async function deleteElevenLabsPhoneNumberIfExists(
  restaurantId: string,
  phoneNumberId: string | null
): Promise<void> {
  if (!phoneNumberId) return;
  try {
    const { deleteElevenLabsPhoneNumber } = await import("@/lib/services/elevenlabs-agent");
    await deleteElevenLabsPhoneNumber(phoneNumberId);
  } catch (phoneError) {
    logger.warn(
      "Impossible de supprimer le numéro ElevenLabs (on continue la suppression de l'agent)",
      {
        restaurantId,
        error: phoneError instanceof Error ? phoneError.message : String(phoneError),
      }
    );
  }
}

export async function deleteElevenLabsAgent(id: string): Promise<ActionResult> {
  "use server";

  const user = await getAppUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
    return { success: false, error: "Non autorisé" };
  }

  const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);

  if (!restaurant) {
    return { success: false, error: "Restaurant non trouvé" };
  }

  if (user.role === "OWNER" && restaurant.ownerId !== user.id) {
    return { success: false, error: "Non autorisé" };
  }

  if (!restaurant.elevenLabsAgentId) {
    return { success: false, error: "Aucun agent ElevenLabs configuré pour ce restaurant" };
  }

  try {
    await deleteElevenLabsPhoneNumberIfExists(id, restaurant.elevenLabsPhoneNumberId);

    const { deleteElevenLabsAgent: deleteAgent } = await import("@/lib/services/elevenlabs-agent");
    await deleteAgent(restaurant.elevenLabsAgentId);

    await db
      .update(restaurants)
      .set({
        elevenLabsAgentId: null,
        elevenLabsPhoneNumberId: null,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, id));

    revalidatePath(`/admin/restaurants/${id}`);
    revalidatePath(`/dashboard`);

    return { success: true };
  } catch (error) {
    logger.error(
      "Erreur suppression agent ElevenLabs",
      error instanceof Error ? error : new Error(String(error))
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression de l'agent",
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

    if (parsed.data.systemPrompt !== undefined) updateData.systemPrompt = parsed.data.systemPrompt;
    if (parsed.data.menuContext !== undefined) updateData.menuContext = parsed.data.menuContext;

    await db.update(restaurants).set(updateData).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    revalidatePath(`/admin/restaurants/${id}`);
    return { success: true };
  } catch (error) {
    logger.error(
      "Erreur mise à jour IA restaurant",
      error instanceof Error ? error : new Error(String(error))
    );
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
    if (parsed.data.twilioPhoneNumber !== undefined)
      updateData.twilioPhoneNumber = parsed.data.twilioPhoneNumber;

    await db.update(restaurants).set(updateData).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    revalidatePath(`/admin/restaurants/${id}`);
    return { success: true };
  } catch (error) {
    logger.error(
      "Erreur mise à jour téléphonie restaurant",
      error instanceof Error ? error : new Error(String(error))
    );
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

    if (parsed.data.stripeCustomerId !== undefined)
      updateData.stripeCustomerId = parsed.data.stripeCustomerId;
    if (parsed.data.billingStartDate !== undefined) {
      updateData.billingStartDate = parsed.data.billingStartDate;
    }

    await db.update(restaurants).set(updateData).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    revalidatePath(`/admin/restaurants/${id}`);
    return { success: true };
  } catch (error) {
    logger.error(
      "Erreur mise à jour facturation restaurant",
      error instanceof Error ? error : new Error(String(error))
    );
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
    if (parsed.data.hubriseCatalogId !== undefined) {
      updateData.hubriseCatalogId = parsed.data.hubriseCatalogId;
    }

    await db.update(restaurants).set(updateData).where(eq(restaurants.id, id));
    revalidatePath("/admin");
    revalidatePath(`/admin/restaurants/${id}`);
    return { success: true };
  } catch (error) {
    logger.error(
      "Erreur mise à jour configuration HubRise",
      error instanceof Error ? error : new Error(String(error))
    );
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
    logger.error(
      "Erreur suppression restaurant",
      error instanceof Error ? error : new Error(String(error))
    );
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

export async function impersonateRestaurant(restaurantId: string): Promise<ActionResult<string>> {
  try {
    const admin = await requireAdmin();

    if (!restaurantId) {
      return { success: false, error: "ID restaurant requis" };
    }

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
    cookieStore.set("admin_impersonator_id", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
    });

    return {
      success: true,
      data: `/dashboard?impersonate=${restaurant.ownerId}`,
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
    logger.error(
      "Erreur arrêt impersonation",
      error instanceof Error ? error : new Error(String(error))
    );
    return { success: false, error: "Erreur lors de l'arrêt de l'impersonation" };
  }
}

export async function toggleRestaurantStatus(id: string, isActive: boolean): Promise<ActionResult> {
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
    logger.error(
      "Erreur toggle statut restaurant",
      error instanceof Error ? error : new Error(String(error))
    );
    return { success: false, error: "Erreur lors de la mise à jour du statut" };
  }
}
