"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DotPatternSubtle } from "@/components/ui/dot-pattern";
import { Check, ArrowRight, Sparkles, Gift, Clock, Settings } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  return (
    <section id="pricing" className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-border overflow-hidden">
      <DotPatternSubtle className="z-0" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <Badge className="mb-4 px-4 py-1.5 bg-muted/50 dark:bg-muted/50 text-foreground border-border">
          Tarification
        </Badge>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
          Un prix simple et transparent
        </h2>
        <p className="text-muted-foreground text-lg">
          Rentable dès la 5ème commande ratée.
        </p>
      </motion.div>

      <div className="relative z-10 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Abonnement */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <Card className="flex flex-col h-full bg-card/30 border-border hover:border-primary/30 transition-all duration-300 noise group">
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl text-foreground mb-2">Abonnement</CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-foreground">299€</span>
                <span className="text-muted-foreground text-lg">/mois</span>
              </div>
              <CardDescription className="text-base mt-4 min-h-[3rem]">
                Pour les gros volumes. Moins cher qu&apos;un temps partiel.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 space-y-4">
              {[
                { text: "Commandes illimitées", icon: Check },
                { text: "Support prioritaire 7j/7", icon: Check },
                { text: "Toutes les mises à jour", icon: Check },
                { text: "Formation incluse", icon: Check },
                { text: "Frais d'installation offerts", icon: Gift, highlight: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.highlight ? 'bg-primary/20' : 'bg-muted dark:bg-muted'}`}>
                    <item.icon className={`w-3 h-3 ${item.highlight ? 'text-primary' : 'text-foreground'}`} />
                  </div>
                  <span className={`text-sm ${item.highlight ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{item.text}</span>
                </div>
              ))}
              <Link href="/contact?subject=plan-fixe">
                <Button variant="outline" className="w-full mt-auto h-12 border-border hover:border-primary hover:bg-accent transition-all duration-300" size="lg">
                  Choisir ce plan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Commission - Populaire */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-primary/20 rounded-3xl blur-xl opacity-60" />
          
          <Card className="relative flex flex-col h-full border-primary overflow-hidden noise" style={{
            background: 'radial-gradient(ellipse at top, rgba(246, 207, 98, 0.08) 0%, hsl(var(--card)) 70%)'
          }}>
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary text-black font-semibold shadow-lg shadow-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Populaire
              </Badge>
            </div>

            <CardHeader className="pb-8">
              <CardTitle className="text-2xl text-foreground mb-2">Commission</CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black gradient-text">5%</span>
                <span className="text-muted-foreground text-lg">par commande</span>
              </div>
              <CardDescription className="text-base mt-4 min-h-[3rem]">
                Zéro risque. Vous ne payez que si vous vendez.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 space-y-4">
              <div className="flex-1 space-y-4">
                {[
                  { text: "Aucun frais fixe", icon: Check },
                  { text: "Toutes les fonctionnalités", icon: Check },
                  { text: "Support réactif", icon: Check },
                  { text: "Sans engagement de durée", icon: Clock, highlight: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <item.icon className="w-3 h-3 text-primary" />
                    </div>
                    <span className={`text-sm ${item.highlight ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{item.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/contact?subject=plan-commission">
                <Button className="w-full mt-auto h-12 bg-primary text-black hover:bg-primary/90 btn-shine font-semibold shadow-lg shadow-primary/30 transition-all duration-300" size="lg">
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Setup Fee Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative z-10 mt-12 max-w-2xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-6 rounded-2xl bg-card/30 border border-border noise">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold text-foreground mb-1">
              Frais de mise en service unique : <span className="text-primary">199€ HT</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Inclut la configuration de votre menu, la création de votre ligne téléphonique IA et la formation de votre équipe.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
