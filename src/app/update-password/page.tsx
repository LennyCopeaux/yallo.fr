import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export const metadata = {
  title: "Changer le mot de passe | Yallo",
  description: "Changez votre mot de passe temporaire pour sécuriser votre compte Yallo.",
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
