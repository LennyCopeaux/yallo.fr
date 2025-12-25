"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Bot, Phone, Receipt } from "lucide-react";
import { ConversationStream } from "@/components/conversation-stream";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center mb-20"
      >
        <Badge className="mb-4 px-4 py-1.5 bg-muted/50 dark:bg-muted/50 text-foreground border-border">
          Simple comme bonjour
        </Badge>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
          Comment ça marche ?
        </h2>
      </motion.div>

      <div className="space-y-24 lg:space-y-32">
        {/* Step 1 */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="order-2 lg:order-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center font-bold">
                1
              </div>
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Étape 1</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Fini la tonalité &apos;Occupé&apos;
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              1 client ou 10 clients appellent en même temps ? Yallo gère des appels illimités en simultané. Ne perdez plus jamais une commande parce que vous étiez déjà au téléphone.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Appels illimités", "Réponse immédiate", "Zéro attente"].map((tag) => (
                <span key={tag} className="text-sm px-3 py-1 rounded-full bg-muted/50 text-muted-foreground border border-border">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="order-1 lg:order-2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 blur-[60px] scale-90" />
              <div className="relative glass rounded-3xl p-6 border-border">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Appels entrants</span>
                    <Badge className="bg-red-500/20 text-red-500 border-red-500/30 text-xs px-2 py-0.5">
                      2
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-400">Live</span>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {[
                    { number: "06 12 34 56 78", label: "Client régulier" },
                    { number: "06 98 76 54 32", label: "Nouveau client" },
                  ].map((call, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-card/30 border border-border"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-bold text-foreground truncate">
                          <span>{call.number.slice(0, 9)}</span>
                          <span className="blur-[3px] select-none">{call.number.slice(9)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{call.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-medium">
                    Yallo gère tout simultanément...
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Step 2 */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 blur-[60px] scale-90" />
              <div className="relative glass rounded-3xl p-6 border-border">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <span className="text-sm text-foreground font-medium">Yallo IA</span>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    En écoute
                  </Badge>
                </div>
                <div className="mb-6">
                  <ConversationStream />
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center font-bold">
                2
              </div>
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Étape 2</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              L&apos;IA prend la commande
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Notre IA comprend le client, gère les demandes spéciales et suggère 
              intelligemment des extras. Elle parle naturellement, sans accent robotique.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Compréhension vocale", "Upsell intelligent", "Multilingue"].map((tag) => (
                <span key={tag} className="text-sm px-3 py-1 rounded-full bg-muted/50 text-muted-foreground border border-border">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Step 3 */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="order-2 lg:order-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center font-bold">
                3
              </div>
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Étape 3</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Transmission instantanée en cuisine
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Dès que le client raccroche, le bon de commande s&apos;imprime automatiquement ou s&apos;affiche sur votre écran cuisine. Zéro ressaisie, zéro erreur. Vos chefs lancent la cuisson immédiatement.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Impression automatique", "Zéro ressaisie", "Prêt à cuisiner"].map((tag) => (
                <span key={tag} className="text-sm px-3 py-1 rounded-full bg-muted/50 text-muted-foreground border border-border">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="order-1 lg:order-2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 blur-[60px] scale-90" />
              <div className="relative flex justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="ticket-paper rounded-3xl p-6 border border-border w-72 relative"
                >
                  <div className="border-b border-dashed border-border pb-4 mb-4">
                    <div className="text-center">
                      <Receipt className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-lg font-bold text-foreground">COMMANDE #2847</div>
                      <div className="text-xs text-muted-foreground">Pour 14:45 - Tel: 06 12 34 56 78</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-foreground">1x Kebab Viande</span>
                      <span className="text-muted-foreground">8.50€</span>
                    </div>
                    <div className="text-xs text-muted-foreground pl-4">→ Sauce blanche + harissa</div>
                    <div className="flex justify-between">
                      <span className="text-foreground">1x Frites</span>
                      <span className="text-muted-foreground">3.00€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground">1x Coca-Cola</span>
                      <span className="text-muted-foreground">2.50€</span>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-border pt-4">
                    <div className="flex justify-between font-bold">
                      <span className="text-foreground">TOTAL</span>
                      <span className="text-primary">14.00€</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
