import Link from "next/link";
import { BackToHomeLink } from "@/components/navigation";
import { ScrollToTop } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Mentions Légales & Confidentialité | Yallo",
  description: "Mentions légales, politique de confidentialité et informations juridiques du site Yallo.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
        <div className="max-w-3xl mx-auto">
          <BackToHomeLink />

          <div className="mt-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-8">
              Mentions Légales & Confidentialité
            </h1>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Éditeur</h2>
                <p className="mb-4">
                  Yallo est un projet édité à titre personnel et non professionnel par Lenny Copeaux,
                  personne physique. Le projet n&apos;est pas immatriculé au registre du commerce et des
                  sociétés à ce jour : il ne dispose donc ni de numéro RCS, ni de numéro SIRET, ni de
                  capital social.
                </p>
                <p>
                  Contact éditeur :{" "}
                  <Link href="mailto:contact@yallo.fr" className="text-primary hover:underline">
                    contact@yallo.fr
                  </Link>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Nature du service</h2>
                <p>
                  Yallo est un service en cours de développement, exploité à des fins de démonstration
                  et d&apos;expérimentation auprès d&apos;établissements pilotes. Il ne constitue pas une
                  offre commerciale ouverte au grand public et peut être modifié ou interrompu à tout
                  moment.
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
                  La reproduction de tout ou partie de ce site sur un support électronique quel qu&apos;il soit est formellement interdite sauf autorisation expresse de l&apos;éditeur.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Données personnelles</h2>
                <p className="mb-4">
                  Yallo traite les données suivantes : les informations de compte des utilisateurs
                  professionnels (nom, adresse e-mail, rôle), les données de configuration des
                  établissements (menu, horaires, paramètres de l&apos;assistant), et les données liées aux
                  appels et aux commandes (numéro de l&apos;appelant, horodatage, durée de l&apos;appel, contenu
                  de la commande).
                </p>
                <p className="mb-4">
                  Ces données servent exclusivement à fournir le service : prise de commande vocale,
                  affichage des commandes en cuisine, facturation de l&apos;abonnement et des minutes
                  consommées, et support. Aucune donnée n&apos;est revendue à des tiers et aucun profilage
                  publicitaire n&apos;est réalisé.
                </p>
                <p className="mb-4">
                  Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression, de limitation et d&apos;opposition aux données personnelles vous concernant.
                </p>
                <p>
                  Pour exercer ces droits, écrivez à{" "}
                  <Link href="mailto:contact@yallo.fr" className="text-primary hover:underline">
                    contact@yallo.fr
                  </Link>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Appels téléphoniques</h2>
                <p>
                  Les appels passés au numéro d&apos;un établissement équipé sont pris en charge par un
                  agent conversationnel automatisé, qui se présente comme tel en début d&apos;appel. L&apos;appel
                  est traité en temps réel par des prestataires de téléphonie et d&apos;intelligence
                  artificielle vocale. Yallo conserve, pour chaque appel, le numéro de l&apos;appelant, la
                  date, la durée et la commande éventuellement enregistrée, afin d&apos;assurer le suivi des
                  commandes et le décompte des minutes facturées.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Sous-traitants</h2>
                <p className="mb-4">
                  Pour fournir le service, Yallo fait appel aux prestataires suivants, chacun
                  n&apos;accédant qu&apos;aux données nécessaires à sa mission :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Vercel — hébergement du site et de l&apos;application</li>
                  <li>Supabase — base de données et authentification</li>
                  <li>Vapi — agent vocal et traitement de l&apos;appel en temps réel</li>
                  <li>Twilio — téléphonie et envoi de SMS de confirmation</li>
                  <li>Stripe — abonnements et facturation</li>
                  <li>Resend — e-mails transactionnels</li>
                  <li>Sentry — supervision des erreurs techniques</li>
                </ul>
                <p className="mt-4">
                  Certains de ces prestataires sont établis en dehors de l&apos;Union européenne. Les
                  transferts correspondants sont encadrés par les garanties prévues par le RGPD,
                  notamment les clauses contractuelles types de la Commission européenne.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies</h2>
                <p>
                  Ce site n&apos;utilise que des cookies strictement nécessaires à son fonctionnement :
                  maintien de la session et de l&apos;authentification des utilisateurs connectés. Aucun
                  cookie publicitaire ni de mesure d&apos;audience tierce n&apos;est déposé, et aucun
                  consentement préalable n&apos;est donc requis.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation de responsabilité</h2>
                <p>
                  L&apos;éditeur ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l&apos;utilisateur, lors de l&apos;accès au site, et résultant soit de l&apos;utilisation d&apos;un matériel ne répondant pas aux spécifications, soit de l&apos;apparition d&apos;un bug ou d&apos;une incompatibilité.
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

              <section>
                <p className="text-sm italic">
                  Dernière mise à jour : septembre 2026
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
