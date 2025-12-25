import { Resend } from "resend";
import { render } from "@react-email/render";
import { WelcomeEmail } from "./emails/welcome-email";
import { ResetPasswordEmail } from "./emails/reset-password-email";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(
  email: string,
  tempPassword: string
): Promise<void> {
  try {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://app.localhost:3000"}/login`;
    
    const html = await render(
      <WelcomeEmail
        email={email}
        tempPassword={tempPassword}
        loginUrl={loginUrl}
      />
    );

    // Version texte pour les clients email qui ne supportent pas HTML
    const text = `Bonjour,

Bienvenue sur Yallo ! Votre compte a été créé avec succès.

Voici vos identifiants de connexion :
Email : ${email}
Mot de passe temporaire : ${tempPassword}

⚠️ IMPORTANT : Pour des raisons de sécurité, vous devrez changer ce mot de passe lors de votre première connexion.

Vous pouvez vous connecter ici : ${loginUrl}

À bientôt,
L'équipe Yallo`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Yallo <onboarding@yallo.fr>",
      to: email,
      subject: "Bienvenue sur Yallo - Vos identifiants de connexion",
      html,
      text,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw new Error("Impossible d'envoyer l'email de bienvenue");
  }
}

export async function sendResetPasswordEmail(
  email: string,
  resetToken: string
): Promise<void> {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://app.localhost:3000"}/reset-password?token=${resetToken}`;
    
    const html = await render(
      <ResetPasswordEmail
        email={email}
        resetToken={resetToken}
        resetUrl={resetUrl}
      />
    );

    // Version texte pour les clients email qui ne supportent pas HTML
    const text = `Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Yallo.

Email concerné : ${email}

Pour réinitialiser votre mot de passe, cliquez sur ce lien :
${resetUrl}

⚠️ IMPORTANT : Ce lien est valide pendant 1 heure.
Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

À bientôt,
L'équipe Yallo`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Yallo <onboarding@yallo.fr>",
      to: email,
      subject: "Réinitialisation de votre mot de passe Yallo",
      html,
      text,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw new Error("Impossible d'envoyer l'email de réinitialisation");
  }
}
