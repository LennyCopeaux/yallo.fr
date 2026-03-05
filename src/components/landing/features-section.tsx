"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mic,
  TrendingUp,
  Check,
  ArrowRight,
  PhoneCall,
  Cloud,
  User,
  Plug,
  Bot,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CARD = "h-full bg-card/30 border-border hover:border-primary/30 transition-all duration-300 noise p-6 flex flex-col";
const ICON = "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors";

function FadeIn({ children, className }: Readonly<{ children: React.ReactNode; className?: string }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FeaturesSection() {
  const [showAll, setShowAll] = useState(false);

  return (
    <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <Badge className="mb-4 px-4 py-1.5 bg-muted/50 text-foreground border-border">
          Fonctionnalités
        </Badge>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
          Tout ce dont vous avez besoin
        </h2>
      </motion.div>

      {/* Bento grid - alternating wide/narrow: 2+1 / 1+2 / 2+1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Row 1: [wide col-2] [narrow col-1] */}
        <FadeIn className="lg:col-span-2 group">
          <Card className={CARD}>
            <CardHeader className="p-0 pb-2">
              <div className={ICON}>
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg text-foreground">Compréhension Vocale Avancée</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col justify-between">
              <CardDescription className="text-base leading-relaxed mb-4">
                L&apos;IA comprend les accents régionaux, le vocabulaire de chaque cuisine et les demandes complexes, dans n&apos;importe quel contexte.
              </CardDescription>
              <div className="flex items-end justify-center gap-1.5 h-12 mb-3">
                {[8, 15, 22, 18, 35, 28, 45, 38, 32, 25, 18, 12, 8, 20, 30, 22].map((baseHeight, i) => {
                  const durations = [0.8, 1, 1.2];
                  const duration = durations[i % 3];
                  return (
                    <motion.div
                      key={`bar-${baseHeight}-${i}`}
                      className="w-1.5 bg-primary rounded-full"
                      animate={{
                        height: [
                          `${Math.min(baseHeight, 40)}px`,
                          `${Math.min(Math.max(baseHeight * 1.5, 10), 48)}px`,
                          `${Math.max(baseHeight * 0.6, 8)}px`,
                          `${Math.min(Math.max(baseHeight * 1.2, 10), 40)}px`,
                          `${Math.min(baseHeight, 40)}px`,
                        ],
                      }}
                      transition={{
                        duration,
                        repeat: 9999,
                        repeatType: "loop",
                        delay: i * 0.06,
                        ease: "easeInOut",
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex gap-2 flex-wrap">
                {["Accents", "Slang", "Multilingue", "24/7"].map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn className="group">
          <Card className={CARD}>
            <CardHeader className="p-0 pb-2">
              <div className={ICON}>
                <Cloud className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg text-foreground">Ligne Infinie</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col justify-between">
              <CardDescription className="leading-relaxed mb-4">
                Plusieurs appels simultanés. Jamais de sonnerie occupé.
              </CardDescription>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card/50 border border-border">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-foreground">Appel {i}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                        <span className="text-[9px] text-emerald-600">Actif</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Row 2: [narrow col-1] [wide col-2] */}
        <FadeIn className="group">
          <Card className={CARD}>
            <CardHeader className="p-0 pb-2">
              <div className={ICON}>
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg text-foreground">Import de Carte</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col justify-between">
              <CardDescription className="leading-relaxed mb-4">
                Importez votre carte PDF, l&apos;IA génère votre menu automatiquement.
              </CardDescription>
              <div className="bg-card/30 rounded-xl border border-border p-3 space-y-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-muted-foreground truncate">carte-restaurant.pdf</span>
                </div>
                <div className="w-full h-px bg-border" />
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-medium text-primary">Menu généré par l&apos;IA</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn className="lg:col-span-2 group">
          <Card className={CARD}>
            <CardHeader className="p-0 pb-2">
              <div className={ICON}>
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg text-foreground">Upsell Intelligent</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <CardDescription className="text-base leading-relaxed mb-4">
                L&apos;IA suggère naturellement boissons et accompagnements selon la commande. Sans jamais forcer.
              </CardDescription>
              <div className="flex-1 flex gap-4 items-end">
                <div className="flex-1 min-h-[80px]">
                  <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="graphGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M0,85 C30,80 50,72 80,60 C110,48 130,40 160,30 C190,20 220,15 250,10 L250,100 L0,100 Z"
                      fill="url(#graphGrad)"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                    />
                    <motion.polyline
                      points="0,85 80,60 160,30 250,10"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2.5"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  </svg>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center shrink-0">
                  <div className="text-3xl font-black text-primary">+18%</div>
                  <div className="text-xs font-medium text-muted-foreground mt-0.5">Panier moyen</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Row 3: [wide col-2] [narrow col-1] — hidden on mobile */}
        <FadeIn className={`lg:col-span-2 group ${showAll ? '' : 'hidden md:block'}`}>
          <Card className={CARD}>
            <CardHeader className="p-0 pb-2">
              <div className={`${ICON} relative`}>
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 3, repeat: 9999, repeatType: "loop", ease: "easeInOut" }}
                  className="absolute"
                >
                  <Bot className="w-6 h-6 text-primary" />
                </motion.div>
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 3, repeat: 9999, repeatType: "loop", ease: "easeInOut" }}
                  className="absolute"
                >
                  <User className="w-6 h-6 text-primary" />
                </motion.div>
              </div>
              <CardTitle className="text-lg text-foreground">Relais Humain</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <CardDescription className="text-base leading-relaxed mb-4">
                L&apos;IA transfère l&apos;appel à votre équipe pour les demandes qui sortent du standard. Aucune perte de contact.
              </CardDescription>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-card/30 border border-border">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Yallo IA</div>
                    <div className="text-xs text-muted-foreground">En ligne</div>
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 2, repeat: 9999, repeatType: "loop", ease: "easeInOut" }}
                >
                  <ArrowRight className="w-5 h-5 text-primary" />
                </motion.div>
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">Votre équipe</div>
                    <div className="text-xs text-emerald-500">Disponible</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn className={`group ${showAll ? '' : 'hidden md:block'}`}>
          <Card className={CARD}>
            <CardHeader className="p-0 pb-2">
              <div className={ICON}>
                <Plug className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg text-foreground">Intégration Caisse</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col justify-between">
              <CardDescription className="leading-relaxed mb-4">
                Connecté à HubRise, menu et stocks synchronisés en temps réel.
              </CardDescription>
              <div className="bg-card/30 rounded-xl border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Plug className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-foreground">Yallo</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: 9999, repeatType: "loop", delay: i * 0.2 }}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-emerald-500">Caisse</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                  <span className="text-[10px] text-muted-foreground">HubRise synchronisé</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="md:hidden flex justify-center mt-6">
        <Button
          variant="outline"
          onClick={() => setShowAll(!showAll)}
          className="border-border hover:border-primary hover:bg-primary/10"
        >
          {showAll ? (
            <>Voir moins <ChevronUp className="w-4 h-4 ml-2" /></>
          ) : (
            <>Voir plus <ChevronDown className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </section>
  );
}
