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
import { Switch } from "@/components/ui/switch";
import {
  Mic,
  TrendingUp,
  Check,
  ArrowRight,
  Settings,
  ToggleRight,
  PhoneCall,
  Cloud,
  User,
  Plug,
  Bot,
} from "lucide-react";

function StockToggleCard() {
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="group"
    >
      <Card className="h-full bg-card/30 border-border hover:border-primary/30 transition-all duration-300 noise p-6 flex flex-col">
        <CardHeader className="p-0 pb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
            <ToggleRight className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-lg text-foreground">Stocks en temps réel</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col justify-between">
          <CardDescription className="leading-relaxed mb-3">
            Plus de sauce blanche ? Désactivez-la en un clic.
          </CardDescription>
          <div className="bg-card/30 rounded-xl border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium transition-all ${isAvailable ? "text-foreground" : "text-muted-foreground line-through"}`}>
                  Sauce Blanche
                </span>
              </div>
              <Switch
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
                className="cursor-pointer scale-90"
              />
            </div>
            <div className="flex items-center justify-between opacity-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-foreground">Frites XL</span>
              </div>
              <Switch checked={true} disabled className="scale-90" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function UpsellIntelligentCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="lg:col-span-2 group"
    >
      <Card className="h-full bg-card/30 border-border hover:border-primary/30 transition-all duration-300 noise p-6 flex flex-col">
        <CardHeader className="p-0 pb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-lg text-foreground">Upsell Intelligent</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col">
          <CardDescription className="text-base leading-relaxed mb-3">
            L&apos;IA suggère boissons et accompagnements en fonction de la commande.
          </CardDescription>
          <div className="flex-1 min-h-[80px] mb-3">
            <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
              <motion.polyline
                points="0,80 30,70 60,50 90,40 120,30 150,20 180,15 200,10"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </svg>
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 w-full text-center">
            <div className="text-2xl font-black text-primary mb-0.5">+18%</div>
            <div className="text-xs font-medium text-muted-foreground">Panier moyen</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <Badge className="mb-4 px-4 py-1.5 bg-muted/50 dark:bg-muted/50 text-foreground border-border">
          Fonctionnalités
        </Badge>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
          Tout ce dont vous avez besoin
        </h2>
      </motion.div>

      {/* Bento Grid - Ligne 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Carte 1 - Grande (Largeur x2) : Compréhension Vocale Avancée */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 group"
        >
          <Card className="h-full bg-card/30 border-border hover:border-primary/30 transition-all duration-300 noise overflow-hidden p-6">
            <CardHeader className="p-0 pb-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg text-foreground">Compréhension Vocale Avancée</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CardDescription className="text-base leading-relaxed mb-4">
                Notre IA comprend les accents régionaux, le slang (&apos;un grec&apos;, &apos;naan&apos;), et les demandes complexes.
              </CardDescription>
              <div className="flex items-end justify-center gap-1.5 h-12 mb-3">
                {[8, 15, 22, 18, 35, 28, 45, 38, 32, 25, 18, 12].map((baseHeight, i) => {
                  const durations = [0.8, 1.0, 1.2];
                  const duration = durations[i % 3];
                  return (
                    <motion.div
                      key={i}
                      className="w-2 bg-primary rounded-full"
                      initial={{ height: `${Math.min(baseHeight, 40)}px` }}
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
                        duration: duration,
                        repeat: 9999,
                        repeatType: "loop",
                        delay: Math.max(i * 0.08, 0),
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
        </motion.div>

        {/* Carte 3 - Moyenne : Ligne Infinie (Scalabilité) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="group"
        >
          <Card className="h-full bg-card/30 border-border hover:border-primary/30 transition-all duration-300 noise p-6 flex flex-col">
            <CardHeader className="p-0 pb-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Cloud className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg text-foreground">Ligne Infinie</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col justify-between">
              <CardDescription className="leading-relaxed mb-4">
                Gère plusieurs appels simultanés. Zéro sonnerie occupé.
              </CardDescription>
              <div className="relative flex flex-col items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: 9999, repeatType: "loop", ease: "easeInOut" }}
                  className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30"
                >
                  <Cloud className="w-6 h-6 text-primary" />
                </motion.div>
                
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full h-8 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                    {[1, 2, 3, 4].map((i) => {
                      const x = 25 + (i - 1) * 50;
                      return (
                        <motion.line
                          key={i}
                          x1="100"
                          y1="50"
                          x2={x}
                          y2="80"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          opacity="0.3"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: [0, 1, 0] }}
                          transition={{
                            duration: 2,
                            repeat: 9999,
                            repeatType: "loop",
                            delay: i * 0.2,
                            ease: "easeInOut",
                          }}
                        />
                      );
                    })}
                  </svg>
                </div>
                
                <div className="flex items-center justify-center gap-3 w-full">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        y: [0, -4, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: 9999,
                        repeatType: "loop",
                        delay: i * 0.15,
                        ease: "easeInOut",
                      }}
                      className="relative"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <PhoneCall className="w-5 h-5 text-primary" />
                      </div>
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 1,
                          repeat: 9999,
                          repeatType: "loop",
                          delay: i * 0.2,
                        }}
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <StockToggleCard />
      </div>

      {/* Bento Grid - Ligne 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UpsellIntelligentCard />

        <div className="lg:col-span-2 grid grid-rows-[auto_auto] gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Carte 5 - Petite : Relais Humain */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="group"
            >
              <Card className="h-full bg-card/30 border-border hover:border-primary/30 transition-all duration-300 noise p-6 flex flex-col">
                <CardHeader className="p-0 pb-2">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors relative">
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
                <CardContent className="p-0 flex-1 flex flex-col justify-between">
                  <CardDescription className="leading-relaxed mb-4">
                    L&apos;IA passe la main à votre équipe pour les cas complexes.
                  </CardDescription>
                  <div className="bg-card/30 rounded-xl border border-border p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">IA</div>
                        <div className="text-xs text-muted-foreground">En cours...</div>
                      </div>
                    </div>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: 9999, repeatType: "loop", ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </motion.div>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">Équipe</div>
                        <div className="text-xs text-emerald-500">Transféré</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Carte 6 - Petite : Carte 100% Flexible */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="group"
            >
              <Card className="h-full bg-card/30 border-border hover:border-primary/30 transition-all duration-300 noise p-6 flex flex-col">
                <CardHeader className="p-0 pb-2">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Carte 100% Flexible</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col justify-between">
                  <CardDescription className="leading-relaxed mb-4">
                    Changez vos prix et vos options en temps réel depuis votre espace.
                  </CardDescription>
                  <div className="bg-card/30 rounded-xl border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">Kebab Viande</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground line-through">8.50€</span>
                        <motion.span
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: 9999, repeatType: "loop" }}
                          className="text-xs font-bold text-primary"
                        >
                          9.00€
                        </motion.span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between opacity-50">
                      <span className="text-xs font-medium text-foreground">Frites</span>
                      <span className="text-xs font-medium text-foreground">3.50€</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Carte 7 - Full Width : Intégration Caisse */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="group"
          >
            <Card className="h-full bg-card/30 border-border hover:border-primary/30 transition-all duration-300 noise p-6 flex flex-col">
              <CardHeader className="p-0 pb-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Plug className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg text-foreground">Intégration Caisse</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col justify-between">
                <CardDescription className="leading-relaxed mb-4">
                  Connectez Yallo à votre logiciel de caisse habituel pour une synchro parfaite.
                </CardDescription>
                <div className="bg-card/30 rounded-xl border border-border p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Plug className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">Yallo</div>
                      <div className="text-xs text-muted-foreground">API</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.5,
                          repeat: 9999,
                          repeatType: "loop",
                          delay: i * 0.2,
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-xs font-medium text-foreground truncate">Votre Caisse</div>
                      <div className="text-xs text-muted-foreground">Connecté</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
