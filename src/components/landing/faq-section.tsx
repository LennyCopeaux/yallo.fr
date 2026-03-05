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
  {
    q: "Comment fonctionne Yallo concrètement ?",
    a: "Yallo est une IA vocale qui répond automatiquement aux appels de votre restaurant. Elle prend les commandes, gère les options et suppléments, propose des upsells, et envoie le ticket directement à votre cuisine. Le client appelle, l'IA gère tout.",
  },
  {
    q: "L'IA comprend-elle bien les clients au téléphone ?",
    a: "Oui. Notre modèle est entraîné sur des milliers d'heures d'appels réels avec différents accents et contextes. Elle comprend le vocabulaire propre à la restauration rapide et sait gérer les demandes complexes, les hésitations et les changements d'avis.",
  },
  {
    q: "Combien de temps prend la mise en place ?",
    a: "Moins de 24h. Vous importez votre carte au format PDF et notre IA génère votre menu automatiquement. Si vous êtes connecté via HubRise, tout se synchronise avec votre logiciel de caisse. Aucune installation technique de votre côté.",
  },
  {
    q: "Puis-je transférer un appel à un employé ?",
    a: "Absolument. L'IA peut transférer l'appel à votre équipe à tout moment. Elle détecte aussi automatiquement les situations qui nécessitent une intervention humaine (réclamation, demande spéciale hors menu).",
  },
  {
    q: "Est-ce que Yallo gère les allergies et demandes spéciales ?",
    a: "Oui. L'IA gère les modifications de commande, les allergies, les demandes spéciales (sans oignon, bien cuit, etc.) et même les annulations. Elle pose les bonnes questions pour s'assurer que tout est correct avant de valider.",
  },
  {
    q: "Comment importer ma carte ?",
    a: "Deux options : soit vous connectez votre logiciel de caisse via HubRise et votre menu se synchronise automatiquement, soit vous importez votre carte au format PDF et notre IA génère le menu pour vous. Dans les deux cas, c'est opérationnel en quelques minutes.",
  },
  {
    q: "Y a-t-il un engagement ?",
    a: "Non. Nos formules sont sans engagement. Vous pouvez arrêter à tout moment. Nous préférons que nos clients restent parce qu'ils sont satisfaits, pas parce qu'ils sont bloqués.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-1"
        >
          <div className="lg:sticky lg:top-32">
            <Badge className="mb-4 px-4 py-1.5 bg-muted/50 text-foreground border-border">
              <MessageCircleQuestion className="w-3.5 h-3.5 mr-1.5" />
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Tout ce que vous devez savoir sur Yallo et comment nous pouvons transformer votre prise de commande.
            </p>
            
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
                    className="text-primary hover:text-primary/80 font-medium text-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    support@yallo.com
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

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
                  key={`faq-${item.q.slice(0, 30)}-${i}`}
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
