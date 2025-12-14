import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Connexion | Yallo",
  description: "Connectez-vous à votre espace Yallo pour gérer vos commandes et votre restaurant.",
};

export default function LoginPage() {
  return <LoginForm />;
}
