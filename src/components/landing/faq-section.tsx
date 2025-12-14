"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircleQuestion, Mail, ArrowRight } from "lucide-react";

const faqItems = [
  { q: "Comment l'IA comprend-elle les accents ?", a: "Notre modèle a été entraîné sur des milliers d'heures d'appels réels avec différents accents français, régionaux et étrangers. Elle comprend parfaitement le slang ('un grec', 'naan') et les demandes complexes." },
  { q: "Puis-je transférer l'appel à un humain ?", a: "Oui ! L'IA peut transférer l'appel à votre équipe à tout moment. Elle détecte aussi automatiquement les situations complexes ou sensibles nécessitant une intervention humaine." },
  { q: "Combien de temps prend l'intégration ?", a: "Moins de 24h. Notre équipe vous accompagne pour configurer votre menu et connecter votre imprimante. Vous pouvez recevoir des commandes dès le lendemain." },
  { q: "Puis-je personnaliser les réponses de l'IA ?", a: "Absolument ! Vous pouvez personnaliser les messages d'accueil, les suggestions d'upsell, et même ajouter des réponses spécifiques à votre restaurant. Tout se configure depuis votre espace en quelques clics." },
  { q: "L'IA peut-elle gérer les modifications de commande ?", a: "Absolument ! L'IA gère les modifications, les allergies, les demandes spéciales ('sans oignon', 'bien cuit') et même les annulations. Elle pose les bonnes questions pour s'assurer que tout est correct." },
  { q: "Quel est le coût par commande ?", a: "Avec notre formule commission, vous payez 5% par commande traitée. Aucun frais fixe, aucun engagement. Vous ne payez que ce que vous utilisez réellement." },
];

export function FaqSection() {
  return (
    <section id="faq" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        {/* Left Column - Title & Support */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-1"
        >
          <div className="lg:sticky lg:top-32">
            <Badge className="mb-4 px-4 py-1.5 bg-muted/50 dark:bg-muted/50 text-foreground border-border">
              <MessageCircleQuestion className="w-3.5 h-3.5 mr-1.5" />
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Tout ce que vous devez savoir sur Yallo et comment nous pouvons transformer votre prise de commande.
            </p>
            
            {/* Support Block */}
            <div className="p-5 rounded-2xl bg-card/30 border border-border noise">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Une autre question ?</h4>
                  <p className="text-sm text-muted-foreground mb-3">Notre équipe vous répond sous 24h.</p>
                  <a 
                    href="mailto:support@yallo.com" 
                    className="text-primary hover:text-primary/80 font-medium text-sm transition-colors inline-flex items-center gap-1.5"
                  >
                    support@yallo.com
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Accordion */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="w-full space-y-3 mb-6">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className={`border border-border rounded-xl px-5 data-[state=open]:border-primary/30 data-[state=open]:bg-primary/5 transition-all duration-300 ${i === faqItems.length - 1 ? 'mb-0' : 'mb-3'}`}
                >
                  <AccordionTrigger className="text-left text-foreground hover:no-underline hover:text-primary transition-colors py-5 text-base">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
