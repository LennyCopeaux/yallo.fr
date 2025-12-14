"use server";

import { Resend } from "resend";
import { z } from "zod";
import { render } from "@react-email/render";
import { ContactEmail } from "@/lib/emails/contact-email";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const contactFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  subject: z.string().refine(
    (val) => ["installation", "rdv-expert", "plan-commission", "plan-fixe", "support", "autre"].includes(val),
    { message: "Veuillez sélectionner un sujet" }
  ),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

const subjectLabels: Record<string, string> = {
  installation: "Installation",
  "rdv-expert": "Parler à un expert",
  "plan-commission": "Plan Commission (5%)",
  "plan-fixe": "Plan Abonnement (299€/mois)",
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

    const html = await render(
      <ContactEmail
        name={name}
        email={email}
        subject={subjectLabel}
        message={message}
      />
    );

    // Version texte pour les clients email qui ne supportent pas HTML
    const text = `Nouveau message de contact

Nom: ${name}
Email: ${email}
Sujet: ${subjectLabel}

Message:
${message}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Yallo <no-reply@yallo.fr>",
      to: process.env.RESEND_TO_EMAIL || "contact@yallo.fr",
      replyTo: email,
      subject: `[Yallo Contact] Nouveau message : ${subjectLabel}`,
      html,
      text,
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
