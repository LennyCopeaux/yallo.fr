"use client";

import { useEffect } from "react";

export default function CGVPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-4xl mx-auto prose prose-invert prose-lg">
        <h1 className="text-4xl font-bold text-white mb-8">Conditions générales de vente</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">1. Objet</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les présentes Conditions Générales de Vente (CGV) régissent les relations entre <strong className="text-white">Yallo SAS</strong> 
            (ci-après « Yallo ») et ses clients (ci-après « le Client ») concernant la fourniture de services SaaS de prise de commande automatisée par IA vocale.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">2. Services proposés</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Yallo propose une solution SaaS permettant :
          </p>
          <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
            <li>La prise de commande automatisée par intelligence artificielle vocale</li>
            <li>La gestion des commandes en temps réel</li>
            <li>L&apos;intégration avec les systèmes de gestion du restaurant</li>
            <li>Le suivi et l&apos;analyse des performances</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">3. Tarification</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Yallo propose deux formules tarifaires :
          </p>
          <div className="bg-card/30 rounded-lg p-6 border border-white/10 mb-4">
            <h3 className="text-xl font-semibold text-white mb-2">Formule Abonnement</h3>
            <p className="text-muted-foreground mb-2">299€ HT par mois</p>
            <p className="text-muted-foreground text-sm">Commandes illimitées, support prioritaire inclus.</p>
          </div>
          <div className="bg-card/30 rounded-lg p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-2">Formule Commission</h3>
            <p className="text-muted-foreground mb-2">5% par commande traitée</p>
            <p className="text-muted-foreground text-sm">Aucun frais fixe, sans engagement de durée.</p>
          </div>
          <p className="text-muted-foreground mt-4">
            Les prix sont exprimés en euros hors taxes. Une TVA de 20% s&apos;applique conformément à la législation française en vigueur.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">4. Frais de mise en service</h2>
          <p className="text-muted-foreground leading-relaxed">
            Des frais de mise en service uniques de 199€ HT peuvent s&apos;appliquer. Ces frais incluent la configuration du menu, 
            la création de la ligne téléphonique IA et la formation de l&apos;équipe. Les frais de mise en service sont précisés 
            lors de la souscription et peuvent être offerts dans le cadre de promotions spécifiques.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">5. Commande et acceptation</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Toute commande de service implique l&apos;acceptation sans réserve des présentes CGV. 
            La commande est considérée comme ferme et définitive après validation par le Client et confirmation écrite de Yallo.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Yallo se réserve le droit de refuser toute commande qui ne serait pas conforme à ses conditions générales de vente 
            ou qui présenterait un caractère anormal ou frauduleux.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">6. Modalités de paiement</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Le paiement s&apos;effectue selon les modalités suivantes :
          </p>
          <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-white">Formule Abonnement :</strong> Paiement mensuel par prélèvement automatique ou virement bancaire</li>
            <li><strong className="text-white">Formule Commission :</strong> Facturation mensuelle des commissions sur les commandes traitées</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            En cas de retard de paiement, Yallo se réserve le droit de suspendre l&apos;accès aux services et d&apos;appliquer 
            des pénalités de retard au taux de 3 fois le taux d&apos;intérêt légal en vigueur.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">7. Droit de rétractation</h2>
          <p className="text-muted-foreground leading-relaxed">
            Conformément à l&apos;article L. 221-18 du Code de la consommation, le Client dispose d&apos;un délai de 14 jours 
            calendaires à compter de la date de souscription pour exercer son droit de rétractation, sans avoir à justifier de motifs 
            ni à payer de pénalité. Ce droit ne s&apos;applique pas aux services entièrement exécutés avant la fin du délai de rétractation 
            avec l&apos;accord exprès du Client.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">8. Durée et résiliation</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong className="text-white">Formule Abonnement :</strong> Engagement mensuel avec tacite reconduction. 
            La résiliation peut être effectuée à tout moment avec un préavis de 30 jours.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-white">Formule Commission :</strong> Sans engagement de durée. 
            La résiliation peut être effectuée à tout moment sans préavis.
          </p>
          <p className="text-muted-foreground mt-4">
            Yallo se réserve le droit de résilier l&apos;accès aux services en cas de manquement grave du Client à ses obligations, 
            notamment en cas de non-paiement ou d&apos;utilisation frauduleuse du service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">9. Disponibilité du service</h2>
          <p className="text-muted-foreground leading-relaxed">
            Yallo s&apos;efforce d&apos;assurer une disponibilité du service 24h/24 et 7j/7. Cependant, Yallo ne peut garantir 
            une disponibilité absolue en raison des contraintes techniques inhérentes à Internet. Yallo se réserve le droit 
            d&apos;interrompre temporairement l&apos;accès au service pour des raisons de maintenance ou de mise à jour.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">10. Responsabilité</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Yallo s&apos;engage à fournir ses services avec diligence et selon les règles de l&apos;art. 
            Cependant, la responsabilité de Yallo est limitée aux dommages directs et prévisibles résultant d&apos;un manquement 
            à ses obligations contractuelles.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Yallo ne pourra être tenu responsable des dommages indirects, notamment la perte de chiffre d&apos;affaires, 
            la perte de clientèle, ou tout autre préjudice commercial.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">11. Propriété intellectuelle</h2>
          <p className="text-muted-foreground leading-relaxed">
            Tous les éléments du service Yallo, notamment les logiciels, bases de données, marques, logos, sont la propriété 
            exclusive de Yallo ou de ses partenaires. Toute reproduction ou utilisation non autorisée est strictement interdite.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">12. Protection des données</h2>
          <p className="text-muted-foreground leading-relaxed">
            Yallo s&apos;engage à respecter la réglementation en vigueur concernant la protection des données personnelles 
            (RGPD). Pour plus d&apos;informations, consultez notre{" "}
            <a href="/confidentialite" className="text-[#f6cf62] hover:text-[#f6cf62]/80">politique de confidentialité</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">13. Droit applicable et juridiction</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les présentes CGV sont régies par le droit français. En cas de litige, et après tentative de résolution amiable, 
            les tribunaux français seront seuls compétents.
          </p>
        </section>

        <section>
          <p className="text-sm text-muted-foreground italic">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </section>
      </div>
    </div>
  );
}
