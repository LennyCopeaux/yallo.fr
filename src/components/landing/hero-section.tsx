"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { DotPatternHero } from "@/components/ui/dot-pattern";

function scrollToFeatures() {
  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection() {
  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      <DotPatternHero className="z-0" />

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center px-2">
        <motion.p
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-sm sm:text-base font-medium text-primary mb-6 sm:mb-8 tracking-widest uppercase"
        >
          IA vocale pour la restauration rapide
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight text-foreground mb-6 sm:mb-8"
        >
          Ne perdez plus
          <br />
          <span className="text-primary">aucune</span> commande
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Yallo prend les commandes par téléphone pour votre restaurant.
          <br className="hidden sm:block" />
          Disponible <span className="text-foreground font-medium">24/7</span>, sans attente, sans erreur.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-14 sm:mb-20"
        >
          <Button
            size="lg"
            onClick={scrollToFeatures}
            className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 bg-primary text-black hover:bg-primary/90 font-semibold rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all cursor-pointer"
          >
            Découvrir
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Link href="/demo" className="cursor-pointer">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 border-border hover:border-primary/50 hover:bg-accent rounded-full transition-all"
            >
              Essayer la démo
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="grid grid-cols-3 gap-6 sm:gap-16 max-w-md sm:max-w-none mx-auto"
        >
          {[
            { value: "98%", label: "Précision" },
            { value: "<2s", label: "Réponse" },
            { value: "24/7", label: "Disponible" },
          ].map((stat, i) => (
            <motion.div
              key={`stat-${stat.value}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        onClick={scrollToFeatures}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-muted-foreground/60 hover:text-primary transition-colors cursor-pointer group"
        aria-label="Défiler vers les fonctionnalités"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-7 h-7 group-hover:scale-110 transition-transform" />
        </motion.div>
      </motion.button>
    </section>
  );
}
