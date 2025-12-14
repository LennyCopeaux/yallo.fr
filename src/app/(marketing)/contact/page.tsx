import { ContactForm } from "@/components/contact/contact-form";

export const metadata = {
  title: "Contact | Yallo",
  description: "Contactez l'équipe Yallo pour toute question ou demande d'information sur notre solution de prise de commande par IA vocale.",
};

export default function ContactPage() {
  return (
    <div className="h-[calc(100vh-7rem)] overflow-hidden flex items-center">
      <ContactForm />
    </div>
  );
}
