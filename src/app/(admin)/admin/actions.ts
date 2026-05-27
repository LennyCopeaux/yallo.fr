"use server";

import { randomBytes } from "node:crypto";
import { requireAdmin, getAppUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users, restaurants, organizations, organizationMembers, restaurantMembers } from "@/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { DEFAULT_STATUS_SETTINGS } from "@/features/kitchen-status/constants";
import { logger } from "@/lib/logger";
import { normalizeFrenchPhoneNumber, toFrenchLocalPhoneNumber } from "@/lib/utils";
import { sendWelcomeEmail } from "@/lib/mail";

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  role: z.enum(["ADMIN", "OWNER", "EMPLOYEE"]),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  role: z.enum(["ADMIN", "OWNER", "EMPLOYEE"]).optional(),
});

const createRestaurantSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100, "Nom trop long"),
  phoneNumber: z.string().min(10, "Numéro invalide"),
  ownerIds: z.array(z.string().uuid()).min(1, "Au moins un propriétaire requis"),
  address: z.string().optional(),
  organizationId: z.string().uuid().optional().nullable(),
});

const updateRestaurantGeneralSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100, "Nom trop long").optional(),
  address: z.string().max(500, "Adresse trop longue").optional().nullable(),
  ownerId: z.string().uuid("ID propriétaire invalide").optional(),
  status: z.enum(["active", "suspended", "onboarding"]).optional(),
  organizationId: z.string().uuid().optional().nullable(),
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
    .refine(
      (val) => {
        if (!val) return true;
        return normalizeFrenchPhoneNumber(val) !== null;
      },
      {
        message:
          "Format invalide. Utilisez le format 0XXXXXXXXX (ex: 0939035299) ou +33XXXXXXXXX (ex: +33939035299)",
      }
    ),
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
      role: "ADMIN" | "OWNER" | "EMPLOYEE";
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

    const ownerIdsRaw = formData.get("ownerIds");
    const ownerIds = ownerIdsRaw
      ? String(ownerIdsRaw).split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const parsed = createRestaurantSchema.safeParse({
      name: formData.get("name"),
      phoneNumber: formData.get("phoneNumber"),
      ownerIds,
      address: formData.get("address") || undefined,
      organizationId: formData.get("organizationId") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données invalides" };
    }

    const { name, phoneNumber, ownerIds: parsedOwnerIds, address, organizationId } = parsed.data;

    const [newRestaurant] = await db.insert(restaurants).values({
      name,
      phoneNumber,
      ownerId: parsedOwnerIds[0],
      address: address || null,
      organizationId: organizationId || null,
      status: "onboarding",
      statusSettings: DEFAULT_STATUS_SETTINGS,
    }).returning({ id: restaurants.id });

    if (newRestaurant) {
      const userRoles = await db
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(inArray(users.id, parsedOwnerIds));
      const roleMap = Object.fromEntries(userRoles.map((u) => [u.id, u.role]));

      await db.insert(restaurantMembers).values(
        parsedOwnerIds.map((userId) => ({
          restaurantId: newRestaurant.id,
          userId,
          role: (roleMap[userId] === "OWNER" ? "owner" : "member") as "owner" | "member",
        }))
      ).onConflictDoNothing();
    }

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
    if (parsed.data.organizationId !== undefined) updateData.organizationId = parsed.data.organizationId;
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

export async function createVapiAgent(
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

    if (restaurant.vapiAssistantId) {
      return { success: false, error: "Un assistant VAPI existe déjà pour ce restaurant" };
    }

    if (!restaurant.twilioPhoneNumber) {
      return {
        success: false,
        error:
          "Veuillez d'abord renseigner le numéro Twilio dans l'onglet Téléphonie avant de créer l'assistant IA",
      };
    }

    const { createVapiAssistant, importTwilioPhoneNumber } =
      await import("@/lib/services/vapi-agent");

    const assistant = await createVapiAssistant(restaurant);

    let vapiPhoneNumberId: string | null = null;
    try {
      const phoneResult = await importTwilioPhoneNumber(
        restaurant.twilioPhoneNumber,
        assistant.id
      );
      vapiPhoneNumberId = phoneResult.phone_number_id;
      logger.info("Numéro Twilio importé et lié à l'assistant VAPI", {
        restaurantId: id,
        assistantId: assistant.id,
        phoneNumberId: phoneResult.phone_number_id,
        phoneNumber: restaurant.twilioPhoneNumber,
      });
    } catch (phoneError) {
      const { deleteVapiAssistant: cleanupAssistant } =
        await import("@/lib/services/vapi-agent");
      try {
        await cleanupAssistant(assistant.id);
      } catch {
        // Ignore
      }
      const errorMessage = phoneError instanceof Error ? phoneError.message : String(phoneError);
      logger.error(
        "Échec import numéro Twilio dans VAPI, assistant supprimé",
        new Error(errorMessage)
      );
      return {
        success: false,
        error: `Impossible d'importer le numéro Twilio (${restaurant.twilioPhoneNumber}) dans VAPI : ${errorMessage}. Vérifiez que le numéro est bien actif sur Twilio et que les identifiants Twilio sont corrects.`,
      };
    }

    await db
      .update(restaurants)
      .set({
        vapiAssistantId: assistant.id,
        vapiPhoneNumberId,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, id));

    revalidatePath(`/admin/restaurants/${id}`);

    return { success: true, data: { agentId: assistant.id } };
  } catch (error) {
    logger.error(
      "Erreur création assistant VAPI",
      error instanceof Error ? error : new Error(String(error))
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la création de l'assistant",
    };
  }
}

export async function updateVapiAgent(id: string): Promise<ActionResult> {
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

    if (!restaurant.vapiAssistantId) {
      return { success: false, error: "Aucun assistant VAPI configuré pour ce restaurant" };
    }

    const { updateVapiAssistant } = await import("@/lib/services/vapi-agent");
    await updateVapiAssistant(restaurant.vapiAssistantId, restaurant);

    revalidatePath(`/admin/restaurants/${id}`);
    revalidatePath(`/dashboard`);

    return { success: true };
  } catch (error) {
    logger.error(
      "Erreur mise à jour assistant VAPI",
      error instanceof Error ? error : new Error(String(error))
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise à jour de l'assistant",
    };
  }
}

async function deleteVapiPhoneNumberIfExists(
  restaurantId: string,
  phoneNumberId: string | null
): Promise<void> {
  if (!phoneNumberId) return;
  try {
    const { deleteVapiPhoneNumber } = await import("@/lib/services/vapi-agent");
    await deleteVapiPhoneNumber(phoneNumberId);
  } catch (phoneError) {
    logger.warn(
      "Impossible de supprimer le numéro VAPI (on continue la suppression de l'assistant)",
      {
        restaurantId,
        error: phoneError instanceof Error ? phoneError.message : String(phoneError),
      }
    );
  }
}

export async function deleteVapiAgent(id: string): Promise<ActionResult> {
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

  if (!restaurant.vapiAssistantId) {
    return { success: false, error: "Aucun assistant VAPI configuré pour ce restaurant" };
  }

  try {
    await deleteVapiPhoneNumberIfExists(id, restaurant.vapiPhoneNumberId);

    const { deleteVapiAssistant } = await import("@/lib/services/vapi-agent");
    await deleteVapiAssistant(restaurant.vapiAssistantId);

    await db
      .update(restaurants)
      .set({
        vapiAssistantId: null,
        vapiPhoneNumberId: null,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, id));

    revalidatePath(`/admin/restaurants/${id}`);
    revalidatePath(`/dashboard`);

    return { success: true };
  } catch (error) {
    logger.error(
      "Erreur suppression assistant VAPI",
      error instanceof Error ? error : new Error(String(error))
    );
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

    if (parsed.data.phoneNumber !== undefined) {
      const localPhone = toFrenchLocalPhoneNumber(parsed.data.phoneNumber);
      if (!localPhone) {
        return {
          success: false,
          error: "Numéro principal invalide. Utilisez 0XXXXXXXXX ou +33XXXXXXXXX.",
        };
      }
      updateData.phoneNumber = localPhone;
    }

    if (parsed.data.twilioPhoneNumber !== undefined) {
      if (!parsed.data.twilioPhoneNumber) {
        updateData.twilioPhoneNumber = null;
      } else {
        const localTwilioPhone = toFrenchLocalPhoneNumber(parsed.data.twilioPhoneNumber);
        if (!localTwilioPhone) {
          return {
            success: false,
            error: "Numéro Twilio invalide. Utilisez 0XXXXXXXXX ou +33XXXXXXXXX.",
          };
        }
        updateData.twilioPhoneNumber = localTwilioPhone;
      }
    }

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

// ─── Organisations ──────────────────────────────────────────────────────────

const createOrganizationSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100, "Nom trop long"),
  ownerIds: z.array(z.string().uuid()).min(1, "Au moins un propriétaire requis"),
});

export async function createOrganization(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const ownerIdsRaw = formData.get("ownerIds");
    const ownerIds = ownerIdsRaw
      ? String(ownerIdsRaw).split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const parsed = createOrganizationSchema.safeParse({
      name: formData.get("name"),
      ownerIds,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
    }

    const [newOrg] = await db.insert(organizations).values({
      name: parsed.data.name,
      ownerId: parsed.data.ownerIds[0],
      isActive: true,
    }).returning({ id: organizations.id });

    if (newOrg) {
      const userRoles = await db
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(inArray(users.id, parsed.data.ownerIds));
      const roleMap = Object.fromEntries(userRoles.map((u) => [u.id, u.role]));

      await db.insert(organizationMembers).values(
        parsed.data.ownerIds.map((userId) => ({
          organizationId: newOrg.id,
          userId,
          role: (roleMap[userId] === "OWNER" ? "owner" : "member") as "owner" | "member",
        }))
      ).onConflictDoNothing();
    }

    revalidatePath("/admin");
    revalidatePath("/admin/organizations");
    return { success: true };
  } catch (error) {
    logger.error("Erreur création organisation", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de la création de l'organisation" };
  }
}

export async function updateOrganization(
  id: string,
  data: { name?: string; ownerId?: string; status?: string }
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (data.name !== undefined) {
      const trimmed = data.name.trim();
      if (trimmed.length < 2 || trimmed.length > 100) {
        return { success: false, error: "Nom invalide (2-100 caractères)" };
      }
      updates.name = trimmed;
    }

    if (data.ownerId !== undefined) {
      updates.ownerId = data.ownerId;
    }

    if (data.status !== undefined) {
      updates.status = data.status;
      updates.isActive = data.status === "active";
    }

    await db.update(organizations).set(updates).where(eq(organizations.id, id));

    revalidatePath("/admin");
    revalidatePath("/admin/organizations");
    revalidatePath(`/admin/organizations/${id}`);
    return { success: true };
  } catch (error) {
    logger.error("Erreur update organisation", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function updateOrganizationBilling(
  id: string,
  data: { stripeCustomerId?: string; billingStartDate?: string }
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.stripeCustomerId !== undefined) updates.stripeCustomerId = data.stripeCustomerId || null;
    if (data.billingStartDate !== undefined) updates.billingStartDate = data.billingStartDate || null;
    await db.update(organizations).set(updates).where(eq(organizations.id, id));
    revalidatePath("/admin/organizations");
    revalidatePath(`/admin/organizations/${id}`);
    return { success: true };
  } catch (error) {
    logger.error("Erreur update billing organisation", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteOrganization(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id) return { success: false, error: "ID requis" };

    // Détacher tous les restaurants de l'organisation avant suppression
    await db
      .update(restaurants)
      .set({ organizationId: null })
      .where(eq(restaurants.organizationId, id));

    await db.delete(organizations).where(eq(organizations.id, id));

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error("Erreur suppression organisation", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

export async function setRestaurantOrganization(
  restaurantId: string,
  organizationId: string | null
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!restaurantId) return { success: false, error: "ID restaurant requis" };

    await db
      .update(restaurants)
      .set({ organizationId })
      .where(eq(restaurants.id, restaurantId));

    // Auto-add all existing org members to this restaurant (skip already-existing memberships)
    if (organizationId) {
      const orgMembersList = await db
        .select({ userId: organizationMembers.userId, role: organizationMembers.role })
        .from(organizationMembers)
        .where(eq(organizationMembers.organizationId, organizationId));

      if (orgMembersList.length > 0) {
        await db.insert(restaurantMembers).values(
          orgMembersList.map((m) => ({
            restaurantId,
            userId: m.userId,
            role: m.role,
          }))
        ).onConflictDoNothing();
      }
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error("Erreur attach/detach restaurant", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

// ─── Members management ──────────────────────────────────────────────────────

export async function addOrganizationMember(orgId: string, userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!orgId || !userId) return { success: false, error: "IDs requis" };

    const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
    const memberRole: "owner" | "member" = user?.role === "OWNER" ? "owner" : "member";

    await db.insert(organizationMembers).values({
      organizationId: orgId,
      userId,
      role: memberRole,
    }).onConflictDoNothing();

    // Auto-add user to all restaurants in the org (skip already-existing memberships)
    const orgRestaurants = await db
      .select({ id: restaurants.id })
      .from(restaurants)
      .where(eq(restaurants.organizationId, orgId));

    if (orgRestaurants.length > 0) {
      await db.insert(restaurantMembers).values(
        orgRestaurants.map((r) => ({
          restaurantId: r.id,
          userId,
          role: memberRole,
        }))
      ).onConflictDoNothing();
    }

    revalidatePath("/admin");
    revalidatePath("/admin/organizations");
    return { success: true };
  } catch (error) {
    logger.error("Erreur ajout membre org", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de l'ajout du membre" };
  }
}

export async function removeOrganizationMember(orgId: string, userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!orgId || !userId) return { success: false, error: "IDs requis" };

    const count = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, orgId));
    if (Number(count[0]?.count ?? 0) <= 1) {
      return { success: false, error: "Impossible de retirer le dernier membre" };
    }

    await db.delete(organizationMembers).where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId)
      )
    );

    revalidatePath("/admin");
    revalidatePath("/admin/organizations");
    return { success: true };
  } catch (error) {
    logger.error("Erreur retrait membre org", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors du retrait" };
  }
}

export async function addRestaurantMember(restaurantId: string, userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!restaurantId || !userId) return { success: false, error: "IDs requis" };

    const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
    const memberRole: "owner" | "member" = user?.role === "OWNER" ? "owner" : "member";

    await db.insert(restaurantMembers).values({
      restaurantId,
      userId,
      role: memberRole,
    }).onConflictDoNothing();

    revalidatePath("/admin");
    revalidatePath(`/admin/restaurants/${restaurantId}`);
    return { success: true };
  } catch (error) {
    logger.error("Erreur ajout membre restaurant", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors de l'ajout" };
  }
}

export async function removeRestaurantMember(restaurantId: string, userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!restaurantId || !userId) return { success: false, error: "IDs requis" };

    const count = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(restaurantMembers)
      .where(eq(restaurantMembers.restaurantId, restaurantId));
    if (Number(count[0]?.count ?? 0) <= 1) {
      return { success: false, error: "Impossible de retirer le dernier membre" };
    }

    await db.delete(restaurantMembers).where(
      and(
        eq(restaurantMembers.restaurantId, restaurantId),
        eq(restaurantMembers.userId, userId)
      )
    );

    revalidatePath("/admin");
    revalidatePath(`/admin/restaurants/${restaurantId}`);
    return { success: true };
  } catch (error) {
    logger.error("Erreur retrait membre restaurant", error instanceof Error ? error : new Error(String(error)));
    return { success: false, error: "Erreur lors du retrait" };
  }
}
