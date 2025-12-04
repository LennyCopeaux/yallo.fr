"use client";

import { ScrollToTop } from "@/components/scroll-to-top";

export default function ConfidentialitePage() {
  return (
    <>
      <ScrollToTop />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
      <div className="max-w-4xl mx-auto prose prose-invert prose-lg">
        <h1 className="text-4xl font-bold text-foreground mb-8">Politique de confidentialité</h1>
        
        <section className="mb-8">
          <p className="text-muted-foreground leading-relaxed mb-4">
            Yallo SAS (ci-après « Yallo » ou « nous ») s&apos;engage à protéger et respecter votre vie privée. 
            Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons 
            vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) 
            et à la loi Informatique et Libertés.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">1. Responsable du traitement</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Le responsable du traitement des données personnelles est :
          </p>
          <div className="bg-card/30 rounded-lg p-6 border border-border">
            <p className="text-foreground mb-2"><strong>Yallo SAS</strong></p>
            <p className="text-muted-foreground mb-1">123 Avenue de la République, 75011 Paris</p>
            <p className="text-muted-foreground mb-1">Email : <a href="mailto:contact@yallo.fr" className="text-primary hover:text-primary/80">contact@yallo.fr</a></p>
            <p className="text-muted-foreground">Téléphone : +33 (0)1 23 45 67 89</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">2. Données collectées</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Nous collectons les données personnelles suivantes :
          </p>
          <div className="bg-card/30 rounded-lg p-6 border border-border mb-4">
            <h3 className="text-xl font-semibold text-foreground mb-3">Données d&apos;identification</h3>
            <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
              <li>Nom, prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Adresse postale</li>
              <li>Informations de facturation</li>
            </ul>
          </div>
          <div className="bg-card/30 rounded-lg p-6 border border-border mb-4">
            <h3 className="text-xl font-semibold text-foreground mb-3">Données de connexion</h3>
            <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
              <li>Adresse IP</li>
              <li>Données de navigation (cookies, logs)</li>
              <li>Identifiants de connexion</li>
            </ul>
          </div>
          <div className="bg-card/30 rounded-lg p-6 border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-3">Données d&apos;utilisation</h3>
            <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
              <li>Historique des commandes</li>
              <li>Préférences et paramètres</li>
              <li>Données de performance et statistiques</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">3. Finalités du traitement</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Vos données personnelles sont traitées pour les finalités suivantes :
          </p>
          <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
            <li>Fourniture et gestion des services SaaS</li>
            <li>Gestion de la relation client et support</li>
            <li>Facturation et gestion des paiements</li>
            <li>Amélioration de nos services et développement de nouvelles fonctionnalités</li>
            <li>Communication marketing (avec votre consentement)</li>
            <li>Respect des obligations légales et réglementaires</li>
            <li>Prévention de la fraude et sécurisation des services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">4. Base légale du traitement</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Le traitement de vos données personnelles est fondé sur :
          </p>
          <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-foreground">L&apos;exécution d&apos;un contrat :</strong> Pour la fourniture des services souscrits</li>
            <li><strong className="text-foreground">Votre consentement :</strong> Pour les communications marketing et l&apos;utilisation de cookies non essentiels</li>
            <li><strong className="text-foreground">L&apos;intérêt légitime :</strong> Pour l&apos;amélioration de nos services et la prévention de la fraude</li>
            <li><strong className="text-foreground">L&apos;obligation légale :</strong> Pour le respect de nos obligations comptables et fiscales</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">5. Conservation des données</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Vos données personnelles sont conservées pour les durées suivantes :
          </p>
          <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-foreground">Données clients actifs :</strong> Pour la durée de la relation contractuelle et 3 ans après la fin du contrat</li>
            <li><strong className="text-foreground">Données de facturation :</strong> 10 ans conformément aux obligations comptables</li>
            <li><strong className="text-foreground">Données de connexion :</strong> 12 mois</li>
            <li><strong className="text-foreground">Données marketing :</strong> 3 ans à compter du dernier contact ou jusqu&apos;à retrait du consentement</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">6. Partage des données</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Vos données peuvent être partagées avec :
          </p>
          <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-foreground">Prestataires techniques :</strong> Hébergeurs (Vercel), fournisseurs de services cloud, pour la fourniture de nos services</li>
            <li><strong className="text-foreground">Prestataires de paiement :</strong> Pour le traitement des transactions</li>
            <li><strong className="text-foreground">Autorités compétentes :</strong> En cas d&apos;obligation légale ou de demande judiciaire</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Nous ne vendons jamais vos données personnelles à des tiers à des fins commerciales.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">7. Transferts internationaux</h2>
          <p className="text-muted-foreground leading-relaxed">
            Certains de nos prestataires peuvent être situés hors de l&apos;Union Européenne. Dans ce cas, nous nous assurons 
            que des garanties appropriées sont mises en place, notamment par l&apos;utilisation de clauses contractuelles types 
            approuvées par la Commission Européenne ou d&apos;autres mécanismes légaux appropriés.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Notre site utilise des cookies pour améliorer votre expérience de navigation et analyser le trafic. 
            Les types de cookies utilisés sont :
          </p>
          <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-foreground">Cookies essentiels :</strong> Nécessaires au fonctionnement du site (pas de consentement requis)</li>
            <li><strong className="text-foreground">Cookies analytiques :</strong> Pour comprendre l&apos;utilisation du site (avec votre consentement)</li>
            <li><strong className="text-foreground">Cookies de préférences :</strong> Pour mémoriser vos choix (avec votre consentement)</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres de votre navigateur.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">9. Vos droits</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="text-muted-foreground list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-foreground">Droit d&apos;accès :</strong> Obtenir une copie de vos données personnelles</li>
            <li><strong className="text-foreground">Droit de rectification :</strong> Corriger vos données inexactes ou incomplètes</li>
            <li><strong className="text-foreground">Droit à l&apos;effacement :</strong> Demander la suppression de vos données (sous certaines conditions)</li>
            <li><strong className="text-foreground">Droit à la limitation :</strong> Limiter le traitement de vos données</li>
            <li><strong className="text-foreground">Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</li>
            <li><strong className="text-foreground">Droit d&apos;opposition :</strong> Vous opposer au traitement de vos données pour motifs légitimes</li>
            <li><strong className="text-foreground">Droit de retrait du consentement :</strong> Retirer votre consentement à tout moment</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Pour exercer ces droits, contactez-nous à :{" "}
            <a href="mailto:contact@yallo.fr" className="text-primary hover:text-primary/80">contact@yallo.fr</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">10. Sécurité</h2>
          <p className="text-muted-foreground leading-relaxed">
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles 
            contre tout accès non autorisé, perte, destruction ou altération. Ces mesures incluent notamment le chiffrement des données, 
            l&apos;authentification forte, et des contrôles d&apos;accès stricts.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">11. Réclamation</h2>
          <p className="text-muted-foreground leading-relaxed">
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la Commission 
            Nationale de l&apos;Informatique et des Libertés (CNIL) :
          </p>
          <div className="bg-card/30 rounded-lg p-6 border border-border mt-4">
            <p className="text-foreground mb-2"><strong>CNIL</strong></p>
            <p className="text-muted-foreground mb-1">3 Place de Fontenoy - TSA 80715</p>
            <p className="text-muted-foreground mb-1">75334 PARIS CEDEX 07</p>
            <p className="text-muted-foreground">
              Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">www.cnil.fr</a>
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">12. Modifications</h2>
          <p className="text-muted-foreground leading-relaxed">
            Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
            Les modifications seront publiées sur cette page avec indication de la date de mise à jour.
          </p>
        </section>

        <section>
          <p className="text-sm text-muted-foreground italic">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </section>
      </div>
    </div>
    </>
  );
}
