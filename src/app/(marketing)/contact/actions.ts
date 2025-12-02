"use server";

import { Resend } from "resend";
import { z } from "zod";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const contactFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  subject: z.string().refine(
    (val) => ["demande_demo", "support", "autre"].includes(val),
    { message: "Veuillez sélectionner un sujet" }
  ),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

const subjectLabels: Record<string, string> = {
  demande_demo: "Réserver une démo",
  support: "Support Technique",
  autre: "Autre demande",
};

export async function submitContactForm(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const validation = contactFormSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Erreur de validation",
    };
  }

  const { name, email, subject, message } = validation.data;

  try {
    const subjectLabel = subjectLabels[subject] || subject;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Yallo <no-reply@yallo.fr>",
      to: process.env.RESEND_TO_EMAIL || "contact@yallo.fr",
      replyTo: email,
      subject: `[Yallo Contact] Nouveau message : ${subjectLabel}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f6cf62;">Nouveau message de contact</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nom:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Sujet:</strong> ${subjectLabel}</p>
          </div>
          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
        </div>
      `,
      text: `
Nouveau message de contact

Nom: ${name}
Email: ${email}
Sujet: ${subjectLabel}

Message:
${message}
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.",
    };
  }
}

