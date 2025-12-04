"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DotPatternHero, DotPatternSubtle } from "@/components/ui/dot-pattern";
import { ConversationStream } from "@/components/conversation-stream";
import {
  Mic,
  TrendingUp,
  Phone,
  Bot,
  Receipt,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Mail,
  MessageCircleQuestion,
  Gift,
  Clock,
  Settings,
  UtensilsCrossed,
  Pizza,
  ChefHat,
  Coffee,
  ToggleRight,
} from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
};

const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const restaurantTypes = [
  { icon: UtensilsCrossed, label: "Kebab/Tacos" },
  { icon: Pizza, label: "Pizzeria" },
  { icon: ChefHat, label: "Burger" },
  { icon: Coffee, label: "Asiatique" },
];

export default function Home() {
  return (
    <div className="relative">
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32">
        {/* Yellow glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#f6cf62]/10 blur-[150px] opacity-50 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">
          {/* Left - Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 px-4 py-1.5 text-sm bg-[#f6cf62]/10 text-[#f6cf62] border-[#f6cf62]/20 hover:bg-[#f6cf62]/15">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Nouveau : Support multilingue
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tight"
            >
              <span className="text-zinc-950 dark:text-white">Votre prise de</span>{" "}
              <span className="gradient-text-hero">commande</span>{" "}
              <span className="text-zinc-950 dark:text-white">automatisée</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              L&apos;IA vocale qui prend les commandes de votre{" "}
              <span className="text-zinc-950 dark:text-white font-medium">Fast Food</span> par
              téléphone. Disponible{" "}
              <span className="text-[#f6cf62] font-semibold">24/7</span>, sans
              accent, sans attente.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="text-base sm:text-lg px-8 h-14 bg-[#f6cf62] text-black hover:bg-[#f6cf62]/90 btn-shine font-semibold glow-yellow-subtle"
              >
                Essayer la démo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base sm:text-lg px-8 h-14 border-white/10 hover:border-white/20 hover:bg-white/5"
              >
                Voir une vidéo
              </Button>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-wrap gap-8 justify-center lg:justify-start"
            >
              {[
                { value: "98%", label: "Précision" },
                { value: "<2s", label: "Temps de réponse" },
                { value: "24/7", label: "Disponibilité" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-[#f6cf62]">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Yellow glow behind */}
              <div className="absolute inset-0 bg-[#f6cf62]/20 blur-[80px] scale-90 opacity-30" />

              {/* Dashboard frame */}
              <div className="relative glass-strong rounded-3xl p-3 sm:p-4 border-white/10">
                <div className="bg-background/80 rounded-2xl overflow-hidden border border-white/5">
                  {/* Status bar */}
                  <div className="bg-card/50 px-4 py-2 flex items-center justify-between border-b border-white/5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Yallo Dashboard
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#f6cf62] animate-pulse-dot" />
                      <span className="text-xs text-[#f6cf62] font-medium">
                        En ligne
                      </span>
                    </div>
                  </div>

                  {/* Dashboard content */}
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-zinc-950 dark:text-white">
                        Commandes en cours
                      </h3>
                      <Badge className="bg-[#f6cf62]/10 text-[#f6cf62] border-[#f6cf62]/20">
                        3 nouvelles
                      </Badge>
                    </div>

                    {[
                      { id: "#2847", items: "2x Kebab Viande, 1x Frites", status: "En préparation", color: "bg-amber-500" },
                      { id: "#2848", items: "1x Tacos XL, 2x Coca", status: "Nouveau", color: "bg-[#f6cf62]" },
                      { id: "#2849", items: "3x Naan Poulet", status: "Prêt", color: "bg-emerald-500" },
                    ].map((order, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.15 }}
                        className="bg-card/30 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-zinc-950 dark:text-white">{order.id}</span>
                              <span className={`${order.color} ${order.color === 'bg-[#f6cf62]' ? 'text-black' : 'text-white'} text-xs px-2 py-0.5 rounded-full font-medium`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {order.items}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" className="shrink-0 hover:bg-white/5">
                            Voir
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 glass rounded-2xl p-3 border-white/10"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#f6cf62]/20 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-[#f6cf62]" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-950 dark:text-white">Appel entrant</div>
                    <div className="text-xs text-muted-foreground">06 ** ** 42</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 glass rounded-2xl p-3 border-white/10"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#f6cf62]/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#f6cf62]" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-950 dark:text-white">IA Active</div>
                    <div className="text-xs text-[#f6cf62]">Prend la commande...</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== SOCIAL PROOF ===================== */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 border-y border-white/5">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider font-medium pt-4">
            Conçu pour votre restaurant
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pb-4">
            {restaurantTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center gap-2 cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f6cf62]/10 flex items-center justify-center border border-[#f6cf62]/20 hover:bg-[#f6cf62]/20 transition-all duration-300">
                  <type.icon className="w-6 h-6 text-[#f6cf62]" />
                </div>
                <span className="text-xs font-medium text-muted-foreground hover:text-[#f6cf62] transition-colors">
                  {type.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===================== HOW IT WORKS - ZIG ZAG ===================== */}
      <section id="how-it-works" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <Badge className="mb-4 px-4 py-1.5 bg-white/5 text-foreground border-white/10">
            Simple comme bonjour
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-950 dark:text-white">
            Comment ça marche ?
          </h2>
        </motion.div>

        <div className="space-y-24 lg:space-y-32">
          {/* Step 1 - Text Left / Visual Right */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInLeft}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#f6cf62] text-black flex items-center justify-center font-bold">
                  1
                </div>
                <span className="text-[#f6cf62] font-medium text-sm uppercase tracking-wider">Étape 1</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white mb-4">
                Le client appelle
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Un client appelle votre restaurant. Yallo décroche automatiquement 
                en moins de 2 secondes. Aucune attente, aucun appel manqué.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Réponse instantanée", "24h/24", "Sans file d'attente"].map((tag) => (
                  <span key={tag} className="text-sm px-3 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInRight}
          transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              {/* Incoming call visual */}
              <div className="relative">
                <div className="absolute inset-0 bg-[#f6cf62]/10 blur-[60px] scale-90" />
                <div className="relative glass rounded-3xl p-6 border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-muted-foreground">Appel entrant</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-400">Live</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div 
                      className="w-16 h-16 rounded-full bg-[#f6cf62]/20 flex items-center justify-center"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, 0],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "easeInOut",
                      }}
                    >
                      <Phone className="w-8 h-8 text-[#f6cf62]" />
                    </motion.div>
                    <div>
                      <div className="text-xl font-bold text-zinc-950 dark:text-white">06 12 34 56 78</div>
                      <div className="text-muted-foreground">Client régulier</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-medium">
                      Yallo décroche...
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Step 2 - Visual Left / Text Right */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInLeft}
              transition={{ duration: 0.6 }}
            >
              {/* AI Processing visual */}
              <div className="relative">
                <div className="absolute inset-0 bg-[#f6cf62]/10 blur-[60px] scale-90" />
                <div className="relative glass rounded-3xl p-6 border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-[#f6cf62]" />
                      <span className="text-sm text-zinc-950 dark:text-white font-medium">Yallo IA</span>
                      </div>
                    <Badge className="bg-[#f6cf62]/10 text-[#f6cf62] border-[#f6cf62]/20">
                      En écoute
                    </Badge>
                  </div>
                  {/* Conversation Stream */}
                  <div className="mb-6">
                    <ConversationStream />
                  </div>
                      </div>
              </div>
            </motion.div>
            
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInRight}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#f6cf62] text-black flex items-center justify-center font-bold">
                  2
                </div>
                <span className="text-[#f6cf62] font-medium text-sm uppercase tracking-wider">Étape 2</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white mb-4">
                L&apos;IA prend la commande
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Notre IA comprend le client, gère les demandes spéciales et suggère 
                intelligemment des extras. Elle parle naturellement, sans accent robotique.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Compréhension vocale", "Upsell intelligent", "Multilingue"].map((tag) => (
                  <span key={tag} className="text-sm px-3 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
        </motion.div>
          </div>

          {/* Step 3 - Text Left / Visual Right */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInLeft}
          transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#f6cf62] text-black flex items-center justify-center font-bold">
                  3
                </div>
                <span className="text-[#f6cf62] font-medium text-sm uppercase tracking-wider">Étape 3</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white mb-4">
                La commande arrive sur votre tablette
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Instantanément après l&apos;appel, la commande s&apos;affiche sur votre tableau de bord Yallo.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Impression instantanée", "Intégration simple", "Temps réel"].map((tag) => (
                  <span key={tag} className="text-sm px-3 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
        </motion.div>

              <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInRight}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              {/* Receipt visual */}
              <div className="relative">
                <div className="absolute inset-0 bg-[#f6cf62]/10 blur-[60px] scale-90" />
                <div className="relative flex justify-center">
                  <motion.div
                    initial={{ y: -20 }}
                    whileInView={{ y: 0 }}
                viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="glass rounded-t-3xl rounded-b-lg p-6 border-white/10 w-72"
                  >
                    <div className="border-b border-dashed border-white/10 pb-4 mb-4">
                      <div className="text-center">
                        <Receipt className="w-8 h-8 text-[#f6cf62] mx-auto mb-2" />
                        <div className="text-lg font-bold text-zinc-950 dark:text-white">COMMANDE #2847</div>
                        <div className="text-xs text-muted-foreground">Pour 14:45 - Tel: 06 12 34 56 78</div>
                  </div>
                  </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-zinc-950 dark:text-white">1x Kebab Viande</span>
                        <span className="text-muted-foreground">8.50€</span>
                </div>
                      <div className="text-xs text-muted-foreground pl-4">→ Sauce blanche + harissa</div>
                      <div className="flex justify-between">
                        <span className="text-zinc-950 dark:text-white">1x Frites</span>
                        <span className="text-muted-foreground">3.00€</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-950 dark:text-white">1x Coca-Cola</span>
                        <span className="text-muted-foreground">2.50€</span>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-white/10 pt-4">
                      <div className="flex justify-between font-bold">
                        <span className="text-zinc-950 dark:text-white">TOTAL</span>
                        <span className="text-[#f6cf62]">14.00€</span>
                      </div>
                    </div>
              </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===================== BENTO FEATURES GRID ===================== */}
      <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 bg-white/5 text-foreground border-white/10">
            Fonctionnalités
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-950 dark:text-white">
            Tout ce dont vous avez besoin
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Large card */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 group"
          >
            <Card className="h-full bg-card/30 border-white/5 hover:border-[#f6cf62]/30 transition-colors duration-300 noise overflow-hidden">
              <CardHeader className="pb-2">
                <div className="w-14 h-14 rounded-2xl bg-[#f6cf62]/10 flex items-center justify-center mb-4 group-hover:bg-[#f6cf62]/20 transition-colors">
                  <Mic className="w-7 h-7 text-[#f6cf62]" />
                </div>
                <CardTitle className="text-2xl text-zinc-950 dark:text-white">Compréhension vocale avancée</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Notre IA comprend les accents régionaux, le slang (&quot;un grec&quot;, &quot;naan&quot;), et les demandes complexes. 
                  Entraînée sur des milliers d&apos;heures d&apos;appels réels.
                </CardDescription>
                <div className="mt-6 flex gap-2 flex-wrap">
                  {["Accents", "Slang", "Multilingue", "24/7"].map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tall card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:row-span-2 group"
          >
            <Card className="h-full bg-card/30 border-white/5 hover:border-[#f6cf62]/30 transition-colors duration-300 noise">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-[#f6cf62]/10 flex items-center justify-center mb-4 group-hover:bg-[#f6cf62]/20 transition-colors">
                  <TrendingUp className="w-7 h-7 text-[#f6cf62]" />
                </div>
                <CardTitle className="text-xl text-zinc-950 dark:text-white">Upsell intelligent</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <CardDescription className="text-base leading-relaxed flex-1">
                  L&apos;IA suggère boissons et accompagnements en fonction de la commande.
                </CardDescription>
                <div className="mt-6 p-4 rounded-xl bg-[#f6cf62]/5 border border-[#f6cf62]/10">
                  <div className="text-3xl font-bold text-[#f6cf62] mb-1">+18%</div>
                  <div className="text-sm text-muted-foreground">Panier moyen</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Regular cards */}
          {[
            { icon: ToggleRight, title: "Gestion des Stocks en Temps Réel", desc: "Plus de sauce blanche ? Désactivez-la en un clic sur votre tablette, l'IA ne la proposera plus aux clients." },
            { icon: Zap, title: "Temps réel", desc: "Suivi en direct des commandes et alertes push." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 * (i + 2) }}
              className="group"
            >
              <Card className="h-full bg-card/30 border-white/5 hover:border-[#f6cf62]/30 transition-colors duration-300 noise">
                  <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-[#f6cf62]/10 flex items-center justify-center mb-3 group-hover:bg-[#f6cf62]/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-[#f6cf62]" />
                  </div>
                  <CardTitle className="text-lg text-zinc-950 dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">{feature.desc}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Wide card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2 group"
          >
            <Card className="h-full bg-card/30 border-white/5 hover:border-[#f6cf62]/30 transition-colors duration-300 noise">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#f6cf62]/10 flex items-center justify-center shrink-0 group-hover:bg-[#f6cf62]/20 transition-colors">
                  <Shield className="w-7 h-7 text-[#f6cf62]" />
                    </div>
                <div>
                  <h3 className="text-xl font-semibold text-zinc-950 dark:text-white mb-2">Transfert humain</h3>
                  <p className="text-muted-foreground">
                    En cas de demande complexe, l&apos;IA transfère l&apos;appel à votre équipe en un clic.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Last card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="group"
          >
            <Card className="h-full bg-card/30 border-white/5 hover:border-[#f6cf62]/30 transition-colors duration-300 noise">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-[#f6cf62]/10 flex items-center justify-center mb-3 group-hover:bg-[#f6cf62]/20 transition-colors">
                  <Sparkles className="w-6 h-6 text-[#f6cf62]" />
                </div>
                <CardTitle className="text-lg text-zinc-950 dark:text-white">Menu personnalisé</CardTitle>
                  </CardHeader>
                  <CardContent>
                <CardDescription className="leading-relaxed">
                  Configurez votre carte, vos prix, vos options.
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      {/* Section commentée pour le lancement
      <section className="py-20 sm:py-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 px-4 py-1.5 bg-white/5 text-white border-white/10">
              Témoignages
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Ce que disent nos clients
            </h2>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="px-4 sm:px-6 lg:px-8"
        >
          <TestimonialsCarousel />
        </motion.div>
      </section>
      */}

      {/* ===================== PRICING ===================== */}
      <section id="pricing" className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-white/5 overflow-hidden">
        <DotPatternSubtle className="z-0" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 bg-white/5 text-foreground border-white/10">
            Tarification
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-950 dark:text-white mb-4">
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
            <Card className="flex flex-col h-full bg-card/30 border-white/10 hover:border-white/30 transition-all duration-300 noise group">
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl text-zinc-950 dark:text-white mb-2">Abonnement</CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-zinc-950 dark:text-white">299€</span>
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
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.highlight ? 'bg-[#f6cf62]/20' : 'bg-white/10'}`}>
                      <item.icon className={`w-3 h-3 ${item.highlight ? 'text-[#f6cf62]' : 'text-zinc-950 dark:text-white'}`} />
                    </div>
                    <span className={`text-sm ${item.highlight ? 'text-[#f6cf62] font-medium' : 'text-muted-foreground'}`}>{item.text}</span>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-auto h-12 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300" size="lg">
                  Choisir ce plan
                </Button>
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
            {/* Glow effect behind card */}
            <div className="absolute -inset-1 bg-[#f6cf62]/20 rounded-3xl blur-xl opacity-60" />
            
            <Card className="relative flex flex-col h-full border-[#f6cf62] overflow-hidden noise" style={{
              background: 'radial-gradient(ellipse at top, rgba(246, 207, 98, 0.08) 0%, hsl(var(--card)) 70%)'
            }}>
              {/* Popular badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-[#f6cf62] text-black font-semibold shadow-lg shadow-[#f6cf62]/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Populaire
                </Badge>
              </div>

              <CardHeader className="pb-8">
                <CardTitle className="text-2xl text-zinc-950 dark:text-white mb-2">Commission</CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black gradient-text">5%</span>
                  <span className="text-muted-foreground text-lg">par commande</span>
                </div>
                <CardDescription className="text-base mt-4 text-muted-foreground min-h-[3rem]">
                  Zéro risque. Vous ne payez que si vous vendez.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-4">
                {[
                  { text: "Aucun frais fixe", icon: Check },
                  { text: "Toutes les fonctionnalités", icon: Check },
                  { text: "Support réactif", icon: Check },
                  { text: "Sans engagement de durée", icon: Clock, highlight: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#f6cf62]/20 flex items-center justify-center shrink-0">
                      <item.icon className="w-3 h-3 text-[#f6cf62]" />
                    </div>
                    <span className={`text-sm ${item.highlight ? 'text-zinc-950 dark:text-white font-medium' : 'text-muted-foreground'}`}>{item.text}</span>
                  </div>
                ))}
                <Button className="w-full mt-auto h-12 bg-[#f6cf62] text-black hover:bg-[#f6cf62]/90 btn-shine font-semibold shadow-lg shadow-[#f6cf62]/30 transition-all duration-300" size="lg">
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-6 rounded-2xl bg-card/30 border border-white/10 noise">
            <div className="w-12 h-12 rounded-xl bg-[#f6cf62]/10 flex items-center justify-center shrink-0">
              <Settings className="w-6 h-6 text-[#f6cf62]" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg font-semibold text-zinc-950 dark:text-white mb-1">
                Frais de mise en service unique : <span className="text-[#f6cf62]">199€ HT</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Inclut la configuration de votre menu, la création de votre ligne téléphonique IA et la formation de votre équipe.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===================== FAQ ===================== */}
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
              <Badge className="mb-4 px-4 py-1.5 bg-white/5 text-foreground border-white/10">
                <MessageCircleQuestion className="w-3.5 h-3.5 mr-1.5" />
              FAQ
            </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-950 dark:text-white mb-4">
                Questions Fréquentes
            </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Tout ce que vous devez savoir sur Yallo et comment nous pouvons transformer votre prise de commande.
              </p>
              
              {/* Support Block */}
              <div className="p-5 rounded-2xl bg-card/30 border border-white/5 noise">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f6cf62]/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-[#f6cf62]" />
          </div>
                  <div>
                    <h4 className="font-semibold text-zinc-950 dark:text-white mb-1">Une autre question ?</h4>
                    <p className="text-sm text-muted-foreground mb-3">Notre équipe vous répond sous 24h.</p>
                    <a 
                      href="mailto:support@yallo.com" 
                      className="text-[#f6cf62] hover:text-[#f6cf62]/80 font-medium text-sm transition-colors inline-flex items-center gap-1.5"
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
                {[
                  { q: "Comment l'IA comprend-elle les accents ?", a: "Notre modèle a été entraîné sur des milliers d'heures d'appels réels avec différents accents français, régionaux et étrangers. Elle comprend parfaitement le slang ('un grec', 'naan') et les demandes complexes." },
                  { q: "Puis-je transférer l'appel à un humain ?", a: "Oui ! L'IA peut transférer l'appel à votre équipe à tout moment. Elle détecte aussi automatiquement les situations complexes ou sensibles nécessitant une intervention humaine." },
                  { q: "Combien de temps prend l'intégration ?", a: "Moins de 30 minutes. Notre équipe vous accompagne pour configurer votre menu et connecter votre imprimante. Vous pouvez recevoir des commandes le jour même." },
                  { q: "Que se passe-t-il en cas de panne internet ?", a: "Yallo dispose d'un système de fallback robuste. Les appels sont automatiquement redirigés vers votre téléphone fixe ou mobile. Aucune commande n'est perdue." },
                  { q: "L'IA peut-elle gérer les modifications de commande ?", a: "Absolument ! L'IA gère les modifications, les allergies, les demandes spéciales ('sans oignon', 'bien cuit') et même les annulations. Elle pose les bonnes questions pour s'assurer que tout est correct." },
                  { q: "Quel est le coût par commande ?", a: "Avec notre formule commission, vous payez 5% par commande traitée. Aucun frais fixe, aucun engagement. Vous ne payez que ce que vous utilisez réellement." },
                  ].map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`item-${i}`}
                      className={`border border-white/5 rounded-xl px-5 data-[state=open]:border-[#f6cf62]/30 data-[state=open]:bg-[#f6cf62]/5 transition-all duration-300 ${i === 5 ? 'mb-0' : 'mb-3'}`}
                    >
                      <AccordionTrigger className="text-left text-zinc-950 dark:text-white hover:no-underline hover:text-[#f6cf62] transition-colors py-5 text-base">
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

      {/* ===================== CTA BANNER ===================== */}
      <section className="relative border-t border-white/5 overflow-hidden">
        {/* Dot Pattern Background */}
        <DotPatternHero className="z-0" />
        
        {/* CTA Section */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <motion.div
            initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-950 dark:text-white mb-6">
              Prêt à automatiser vos commandes ?
              </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10">
              Rejoignez les centaines de restaurants qui ont déjà automatisé leur prise de commande.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#f6cf62] text-black hover:bg-[#f6cf62]/90 h-14 px-8 text-lg btn-shine font-semibold glow-yellow">
                  Démarrer l&apos;essai gratuit
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              <Button size="lg" variant="outline" className="border-white/10 hover:border-white/20 h-14 px-8 text-lg">
                  Parler à un expert
                </Button>
              </div>
            <p className="text-sm text-muted-foreground mt-6">
              Pas de carte bancaire • Installation en 30 minutes
              </p>
            </motion.div>
          </div>
      </section>

      {/* ===================== FAT FOOTER ===================== */}
      <footer className="relative overflow-hidden">
        {/* Links Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-zinc-950 dark:text-white mb-4">Produit</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/#how-it-works" className="text-muted-foreground hover:text-[#f6cf62] transition-colors text-sm">
                    Comment ça marche
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="text-muted-foreground hover:text-[#f6cf62] transition-colors text-sm">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="text-muted-foreground hover:text-[#f6cf62] transition-colors text-sm">
                    Tarification
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="text-muted-foreground hover:text-[#f6cf62] transition-colors text-sm">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-950 dark:text-white mb-4">Légal</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/confidentialite" className="text-muted-foreground hover:text-[#f6cf62] transition-colors text-sm">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/cgv" className="text-muted-foreground hover:text-[#f6cf62] transition-colors text-sm">
                    CGV
                  </Link>
                </li>
                <li>
                  <Link href="/mentions-legales" className="text-muted-foreground hover:text-[#f6cf62] transition-colors text-sm">
                    Mentions légales
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-950 dark:text-white mb-4">Contact</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/contact?subject=support" className="text-muted-foreground hover:text-[#f6cf62] transition-colors text-sm">
                    Support Technique
                  </Link>
                </li>
                <li>
                  <Link href="/contact?subject=demo" className="text-muted-foreground hover:text-[#f6cf62] transition-colors text-sm">
                    Réserver une démo
                  </Link>
                </li>
                <li>
                  <Link href="/contact?subject=autre" className="text-muted-foreground hover:text-[#f6cf62] transition-colors text-sm">
                    Devenir Partenaire
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-950 dark:text-white mb-4">Ressources</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
                    const port = typeof window !== "undefined" && window.location.port ? window.location.port : "3000";
                    const appUrl = hostname.includes("localhost") 
                      ? `http://app.localhost:${port}/login`
                      : "https://app.yallo.fr/login";
                    window.location.href = appUrl;
                  }} className="text-muted-foreground hover:text-[#f6cf62] transition-colors text-sm">
                    Espace Restaurateur
                  </a>
                </li>
                <li>
                  <Link href="/guide" className="text-muted-foreground hover:text-[#f6cf62] transition-colors text-sm">
                    Guide de démarrage
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="text-muted-foreground hover:text-[#f6cf62] transition-colors text-sm">
                    État du service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black gradient-text">Yallo</span>
              <span className="text-muted-foreground text-sm">
                © {new Date().getFullYear()}. Tous droits réservés.
            </span>
          </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-emerald-400">Tous les systèmes opérationnels</span>
            </div>
          </div>
        </div>

        {/* Giant YALLO text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none">
          <div className="text-[12rem] sm:text-[18rem] md:text-[24rem] font-black text-zinc-950/[0.02] dark:text-white/[0.02] leading-none tracking-tighter whitespace-nowrap">
            YALLO
          </div>
        </div>
      </footer>
    </div>
  );
}
