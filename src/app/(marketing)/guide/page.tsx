import Link from "next/link";
import { BackToHomeLink } from "@/components/back-to-home-link";
import { ScrollToTop } from "@/components/scroll-to-top";

export const metadata = {
  title: "Guide de démarrage | Yallo",
  description: "Découvrez comment démarrer avec Yallo en 5 minutes. Guide complet pour configurer votre assistant vocal de prise de commande.",
};

const steps = [
  {
    number: 1,
    title: "Contactez-nous",
    description: (
      <>
        Si vous êtes intéressé par Yallo,{" "}
        <Link href="/contact?subject=demo" className="text-primary hover:text-primary/80 underline">
          contactez-nous
        </Link>
        {" "}pour discuter de vos besoins. Notre équipe vous accompagne dans votre démarche et répond à toutes vos questions.
      </>
    ),
  },
  {
    number: 2,
    title: "Création de vos accès",
    description: "Une fois votre demande validée, nous créons votre compte Yallo. Vous recevrez un email avec vos identifiants de connexion temporaires (email et mot de passe temporaire).",
  },
  {
    number: 3,
    title: "Réinitialisation du mot de passe",
    description: "Lors de votre première connexion avec vos identifiants temporaires, vous devrez réinitialiser votre mot de passe pour des raisons de sécurité. Choisissez un mot de passe fort et sécurisé.",
  },
  {
    number: 4,
    title: "Configuration du menu",
    description: "Accédez à votre tableau de bord et configurez votre menu : ajoutez vos catégories, vos produits, leurs variations et leurs prix. L'interface est intuitive et vous permet de tout configurer en quelques minutes.",
  },
  {
    number: 5,
    title: "Activation du transfert d'appel",
    description: "Configurez le transfert d'appel depuis votre ligne téléphonique vers Yallo. Notre équipe vous accompagne dans cette étape pour garantir une mise en service rapide et sans interruption de votre service.",
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 w-full">
        <div className="max-w-3xl mx-auto">
          <BackToHomeLink />
          
          <div className="mt-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-8">
              Démarrez en 5 minutes
            </h1>
        
            <div className="space-y-8">
              {steps.map((step) => (
                <div key={step.number} className="bg-card/30 rounded-lg p-8 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-primary">{step.number}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-3">
                        {step.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                Besoin d&apos;aide ? Notre équipe est là pour vous accompagner.
              </p>
              <Link 
                href="/contact?subject=support"
                className="inline-block px-6 py-3 bg-primary text-black hover:bg-primary/90 rounded-lg font-semibold transition-colors"
              >
                Contacter le support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
