"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GuidePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-12 text-center">
          Démarrez en 5 minutes
        </h1>
        
        <div className="space-y-8">
          <div className="bg-card/30 rounded-lg p-8 border border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  Contactez-nous
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Si vous êtes intéressé par Yallo,{" "}
                  <Link href="/contact?subject=demo" className="text-primary hover:text-primary/80 underline">
                    contactez-nous
                  </Link>
                  {" "}pour discuter de vos besoins. Notre équipe vous accompagne dans votre démarche et répond à toutes vos questions.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card/30 rounded-lg p-8 border border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  Création de vos accès
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Une fois votre demande validée, nous créons votre compte Yallo. Vous recevrez un email avec vos identifiants de connexion temporaires (email et mot de passe temporaire).
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card/30 rounded-lg p-8 border border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  Réinitialisation du mot de passe
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Lors de votre première connexion avec vos identifiants temporaires, vous devrez réinitialiser votre mot de passe pour des raisons de sécurité. Choisissez un mot de passe fort et sécurisé.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card/30 rounded-lg p-8 border border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-primary">4</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  Configuration du menu
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Accédez à votre tableau de bord et configurez votre menu : ajoutez vos catégories, vos produits, leurs variations et leurs prix. 
                  L&apos;interface est intuitive et vous permet de tout configurer en quelques minutes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card/30 rounded-lg p-8 border border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-primary">5</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  Activation du transfert d&apos;appel
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Configurez le transfert d&apos;appel depuis votre ligne téléphonique vers Yallo. Notre équipe vous accompagne dans cette étape 
                  pour garantir une mise en service rapide et sans interruption de votre service.
                </p>
              </div>
            </div>
          </div>
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
  );
}
