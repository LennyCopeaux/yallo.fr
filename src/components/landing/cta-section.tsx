"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { DotPatternHero } from "@/components/ui/dot-pattern";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="relative border-t border-border overflow-hidden">
      <DotPatternHero className="z-0" />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-6">
            Prêt à automatiser vos commandes ?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10">
            Rejoignez les centaines de restaurants qui ont déjà automatisé leur prise de commande.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact?subject=installation">
              <Button size="lg" className="bg-primary text-black hover:bg-primary/90 h-14 px-8 text-lg btn-shine font-semibold glow-yellow">
                Demander mon installation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact?subject=rdv-expert">
              <Button size="lg" variant="outline" className="border-border hover:border-primary hover:bg-accent h-14 px-8 text-lg">
                Parler à un expert
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Pas de carte bancaire • Intégration en moins de 24h
          </p>
        </motion.div>
      </div>
    </section>
  );
}
