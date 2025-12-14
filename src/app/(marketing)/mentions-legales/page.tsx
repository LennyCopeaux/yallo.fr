import { ScrollToTop } from "@/components/scroll-to-top";
import { BackToHomeLink } from "@/components/back-to-home-link";

export const metadata = {
  title: "Mentions légales | Yallo",
  description: "Mentions légales complètes du site Yallo : éditeur, hébergement, propriété intellectuelle, protection des données.",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <ScrollToTop />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          <BackToHomeLink />
          <h1 className="text-4xl font-bold text-foreground mb-8">Mentions légales</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Éditeur du site</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Le site <strong className="text-foreground">yallo.fr</strong> est édité par :
            </p>
            <div className="bg-card/30 rounded-lg p-6 border border-border">
              <p className="text-foreground mb-2"><strong>Yallo SAS</strong></p>
              <p className="text-muted-foreground mb-1">Société par Actions Simplifiée au capital de 10 000 €</p>
              <p className="text-muted-foreground mb-1">RCS Paris B 123 456 789</p>
              <p className="text-muted-foreground mb-1">SIRET : 123 456 789 00012</p>
              <p className="text-muted-foreground mb-1">Siège social : 123 Avenue de la République, 75011 Paris</p>
              <p className="text-muted-foreground mb-1">Téléphone : +33 (0)1 23 45 67 89</p>
              <p className="text-muted-foreground">
                Email : <a href="mailto:contact@yallo.fr" className="text-primary hover:text-primary/80">contact@yallo.fr</a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Directeur de publication</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le directeur de publication est le représentant légal de Yallo SAS.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Hébergement</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Le site est hébergé par :
            </p>
            <div className="bg-card/30 rounded-lg p-6 border border-border">
              <p className="text-foreground mb-2"><strong>Vercel Inc.</strong></p>
              <p className="text-muted-foreground mb-1">340 S Lemon Ave #4133</p>
              <p className="text-muted-foreground mb-1">Walnut, CA 91789</p>
              <p className="text-muted-foreground mb-1">États-Unis</p>
              <p className="text-muted-foreground">
                Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">vercel.com</a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Propriété intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur et la propriété intellectuelle. 
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La reproduction de tout ou partie de ce site sur un support électronique quel qu&apos;il soit est formellement interdite sauf autorisation expresse du directeur de publication.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Protection des données personnelles</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), 
              vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition aux données personnelles vous concernant.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Pour exercer ces droits, vous pouvez nous contacter à l&apos;adresse :{" "}
              <a href="mailto:contact@yallo.fr" className="text-primary hover:text-primary/80">contact@yallo.fr</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ce site utilise des cookies pour améliorer l&apos;expérience utilisateur et analyser le trafic. 
              En continuant à naviguer sur ce site, vous acceptez l&apos;utilisation de cookies. 
              Pour plus d&apos;informations, consultez notre{" "}
              <a href="/confidentialite" className="text-primary hover:text-primary/80">politique de confidentialité</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitation de responsabilité</h2>
            <p className="text-muted-foreground leading-relaxed">
              Yallo SAS ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l&apos;utilisateur, 
              lors de l&apos;accès au site yallo.fr, et résultant soit de l&apos;utilisation d&apos;un matériel ne répondant pas aux spécifications, 
              soit de l&apos;apparition d&apos;un bug ou d&apos;une incompatibilité.
            </p>
          </section>

          <section>
            <p className="text-sm text-muted-foreground italic">
              Dernière mise à jour : Janvier 2025
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
