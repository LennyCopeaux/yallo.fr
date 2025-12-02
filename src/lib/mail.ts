import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(
  email: string,
  tempPassword: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Yalla <onboarding@yalla.fr>",
      to: email,
      subject: "Bienvenue sur Yalla - Vos identifiants de connexion",
      text: `Bonjour,

Bienvenue sur Yalla ! Votre compte a été créé avec succès.

Voici vos identifiants de connexion :
Email : ${email}
Mot de passe temporaire : ${tempPassword}

⚠️ IMPORTANT : Pour des raisons de sécurité, vous devrez changer ce mot de passe lors de votre première connexion.

Vous pouvez vous connecter ici : ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login

À bientôt,
L'équipe Yalla`,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw new Error("Impossible d'envoyer l'email de bienvenue");
  }
}

