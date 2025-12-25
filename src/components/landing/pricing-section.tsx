"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { DotPatternSubtle } from "@/components/ui/dot-pattern";
import {
  ArrowRight,
  Sparkles,
  Clock,
  Smartphone,
  Tablet,
  Settings,
  MessageCircle,
  Shield,
} from "lucide-react";
import Link from "next/link";

type PricingConfig = {
  monthlyPrice: number;
  setupFee: number;
  includedMinutes: number;
  overflowPricePerMinute: number;
};

interface PricingSectionProps {
  pricingConfig: PricingConfig;
}

export function PricingSection({ pricingConfig }: PricingSectionProps) {
  const monthlyPrice = pricingConfig.monthlyPrice / 100; // Convertir centimes en euros
  const setupFee = pricingConfig.setupFee / 100;
  const includedMinutes = pricingConfig.includedMinutes;
  const overflowPricePerMinute = pricingConfig.overflowPricePerMinute / 100;

  const features = [
    {
      text: "IA Vocale disponible 24h/24 et 7j/7",
      icon: Clock,
    },
    {
      text: `${includedMinutes} minutes d'appels incluses`,
      icon: Smartphone,
    },
    {
      text: "Dashboard Tablette Cuisine (PWA)",
      icon: Tablet,
    },
    {
      text: "Modifications du menu illimitées",
      icon: Settings,
    },
    {
      text: "Support prioritaire WhatsApp",
      icon: MessageCircle,
    },
  ];

  return (
    <section
      id="pricing"
      className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-border overflow-hidden"
    >
      <DotPatternSubtle className="z-0" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <Badge className="mb-4 px-4 py-1.5 bg-muted/50 dark:bg-muted/50 text-foreground border-border">
          Tarification
        </Badge>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
          Un prix simple et transparent
        </h2>
      </motion.div>

      {/* Single Card - Centered */}
      <div className="relative z-10 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full max-w-5xl"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-primary/20 rounded-3xl blur-2xl opacity-50" />

          <Card
            className="relative glass-strong border-border overflow-hidden noise"
            style={{
              background: `linear-gradient(135deg, hsl(var(--card) / 0.9) 0%, hsl(var(--card) / 0.7) 100%)`,
            }}
          >
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--pattern)) 1px, transparent 0)`,
                backgroundSize: "20px 20px",
              }}
            />

            <CardContent className="relative z-10 p-6 sm:p-8 md:p-10">
              {/* Grid Layout: 2 columns on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                
                {/* LEFT COLUMN: Finance & Action */}
                <div className="flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Badge */}
                    <div className="flex justify-start">
                      <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
                        <Sparkles className="w-3 h-3 mr-1.5" />
                        Offre Unique
                      </Badge>
                    </div>

                    {/* Title */}
                    <CardTitle className="text-3xl sm:text-4xl font-bold text-foreground">
                      Yallo Infinity
                    </CardTitle>

                    {/* Hook phrase */}
                    <p className="text-sm font-medium text-primary">
                      Rentable dès le 5ème appel récupéré.
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl sm:text-7xl font-black text-foreground">
                        {monthlyPrice.toFixed(0)}€
                      </span>
                      <span className="text-muted-foreground text-xl">/mois</span>
                    </div>
                    <CardDescription className="text-base text-muted-foreground">
                      sans engagement
                    </CardDescription>

                    {/* Setup fee - Compact */}
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">
                        Frais de mise en service unique :
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        <span className="text-primary">{setupFee.toFixed(0)}€</span>
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href="/contact?subject=installation" className="block">
                    <Button
                      className="w-full h-14 bg-primary text-black hover:bg-primary/90 btn-shine font-semibold shadow-lg shadow-primary/30 transition-all duration-300 text-base sm:text-lg"
                      size="lg"
                    >
                      Commander mon IA
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* RIGHT COLUMN: Features & Details */}
                <div className="flex flex-col justify-between space-y-6">
                  {/* Features list - 2 columns for compactness */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3">
                    {features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <feature.icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-xs sm:text-sm text-foreground leading-relaxed">
                          {feature.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Security notice */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50"
                  >
                    <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        <span className="font-medium text-foreground">Sécurité :</span>{" "}
                        Au-delà de {includedMinutes} minutes : {overflowPricePerMinute.toFixed(2)}€ / min supplémentaire. Vous ne
                        payez que ce que vous consommez vraiment en cas de gros rush.
                      </p>
                    </div>
                  </motion.div>
                </div>

              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
