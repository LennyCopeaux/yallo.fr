import Link from "next/link";
import { BackToHomeLink } from "@/components/back-to-home-link";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Mentions Légales & Confidentialité | Yallo",
  description: "Mentions légales, politique de confidentialité et informations juridiques du site Yallo.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 w-full">
        <div className="max-w-3xl mx-auto">
          <BackToHomeLink />
          
          <div className="mt-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-8">
              Mentions Légales & Confidentialité
            </h1>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Éditeur</h2>
                <p>
                  Site édité à titre personnel. Projet en cours d&apos;immatriculation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Hébergement</h2>
                <p className="mb-4">
                  Le site est hébergé par :
                </p>
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-4 pb-4">
                    <div className="space-y-2">
                      <p className="font-bold text-foreground text-lg">
                        Vercel Inc.
                      </p>
                      <div className="text-muted-foreground space-y-1">
                        <p>340 S Lemon Ave #4133</p>
                        <p>Walnut, CA 91789</p>
                        <p>États-Unis</p>
                      </div>
                      <p className="pt-2 text-muted-foreground">
                        Site web :{" "}
                        <Link href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                          vercel.com
                        </Link>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Propriété intellectuelle</h2>
                <p className="mb-4">
                  L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                </p>
                <p>
                  La reproduction de tout ou partie de ce site sur un support électronique quel qu&apos;il soit est formellement interdite sauf autorisation expresse du directeur de publication.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Protection des données personnelles</h2>
                <p className="mb-4">
                  Les données collectées via le formulaire de contact ne sont utilisées que pour répondre à votre demande. 
                  Aucune donnée n&apos;est revendue à des tiers.
                </p>
                <p className="mb-4">
                  Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition aux données personnelles vous concernant.
                </p>
                <p>
                  Pour exercer ces droits, vous pouvez nous contacter à l&apos;adresse :{" "}
                  <Link href="mailto:contact@yallo.fr" className="text-primary hover:underline">
                    contact@yallo.fr
                  </Link>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies</h2>
                <p>
                  Ce site utilise des cookies pour améliorer l&apos;expérience utilisateur et analyser le trafic. En continuant à naviguer sur ce site, vous acceptez l&apos;utilisation de cookies. Pour plus d&apos;informations, consultez notre politique de confidentialité.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation de responsabilité</h2>
                <p>
                  Yallo SAS ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l&apos;utilisateur, lors de l&apos;accès au site yallo.fr, et résultant soit de l&apos;utilisation d&apos;un matériel ne répondant pas aux spécifications, soit de l&apos;apparition d&apos;un bug ou d&apos;une incompatibilité.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Contact</h2>
                <p>
                  Pour toute question concernant ces mentions légales ou la protection de vos données, 
                  vous pouvez nous contacter via la{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    page Contact
                  </Link>
                  .
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
