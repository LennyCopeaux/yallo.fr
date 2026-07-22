"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { DotPatternSubtle } from "@/components/ui/dot-pattern";
import {
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";

type Plan = {
  name: string;
  subtitle: string;
  monthlyPrice: number;
  callRate: string;
  popular: boolean;
  popularLabel?: string;
  kicker?: string;
  ctaLabel: string;
  contactSubject: string;
  included: string[];
  excluded: string[];
};

function normalizeFeature(feature: string): string {
  return feature.trim().toLowerCase();
}

function getIncrementalFeatures(plan: Plan, previousPlan?: Plan): string[] {
  if (!previousPlan) {
    return plan.included;
  }

  const previousSet = new Set(previousPlan.included.map((feature) => normalizeFeature(feature)));
  return plan.included.filter((feature) => !previousSet.has(normalizeFeature(feature)));
}

const PLANS: Plan[] = [
  {
    name: "Essentiel",
    subtitle: "Pour les petits établissements qui veulent tester sans risque",
    monthlyPrice: 49,
    callRate: "0,19€ / minute d'appel",
    popular: false,
    ctaLabel: "Commencer",
    contactSubject: "plan-essentiel",
    included: [
      "1 numéro de téléphone dédié",
      "2 appels simultanés max",
      "IA vocale 24h/24, 7j/7",
      "Dashboard tablette",
      "Gestion des commandes en temps réel",
      "Menu illimité",
      "Mise à jour instantanée",
      "Support email",
    ],
    excluded: [],
  },
  {
    name: "Pro",
    subtitle: "Pour les établissements actifs qui veulent une solution complète",
    monthlyPrice: 99,
    callRate: "0,17€ / minute d'appel",
    popular: true,
    popularLabel: "Le plus choisi",
    ctaLabel: "Démarrer",
    contactSubject: "plan-pro",
    included: [
      "1 numéro de téléphone dédié",
      "4 appels simultanés max",
      "IA vocale 24h/24, 7j/7",
      "Dashboard tablette",
      "Gestion des commandes en temps réel",
      "Menu illimité",
      "Mise à jour instantanée",
      "Support email",
      "Connexion logiciel de caisse",
      "Sépare commandes & renseignements",
      "Analytics & historique des appels",
      "Rapports hebdomadaires par email",
      "Support email prioritaire",
      "Réponse sous 4h en semaine",
    ],
    excluded: [],
  },
  {
    name: "Business",
    subtitle: "Pour les établissements à fort volume ou les chaînes multi-sites",
    monthlyPrice: 199,
    callRate: "0,15€ / minute d'appel",
    popular: false,
    ctaLabel: "Commencer",
    contactSubject: "plan-business",
    included: [
      "1 numéro de téléphone dédié par restaurant",
      "10 appels simultanés max",
      "Connexion logiciel de caisse",
      "IA vocale 24h/24, 7j/7",
      "Dashboard tablette",
      "Gestion des commandes en temps réel",
      "Menu illimité",
      "Mise à jour instantanée",
      "Support email",
      "Sépare commandes & renseignements",
      "Analytics & historique des appels",
      "Rapports hebdomadaires par email",
      "Support prioritaire",
      "Réponse sous 4h en semaine",
      "Transfert vers humain",
      "Bascule vers un employé si besoin",
      "Personnalisation avancée de l'IA",
      "Ton, script, promotions...",
      "Multi-sites",
      "Gérez plusieurs adresses depuis un dashboard",
      "Support dédié",
      "Interlocuteur fixe, réponse sous 1h",
    ],
    excluded: [],
  },
];

export function PricingSection() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  const [api, setApi] = React.useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
    api.on("select", () => {
      setSelectedIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const renderPlanCard = (plan: typeof PLANS[0], index: number) => {
    const previousPlan = index > 0 ? PLANS[index - 1] : undefined;
    const incrementalFeatures = getIncrementalFeatures(plan, previousPlan);

    return (
    <Card
      className={`relative overflow-hidden h-full flex flex-col transition-all bg-card ${
        plan.popular
          ? "border-2 border-primary shadow-lg"
          : "border border-border"
      }`}
    >
      {plan.popular && (
        <div className="absolute top-4 right-4 z-20">
          <Badge className="bg-primary text-black border-primary px-3 py-1 font-semibold shadow-lg">
            <Sparkles className="w-3 h-3 mr-1.5" />
            {plan.popularLabel ?? "Populaire"}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        {plan.kicker && (
          <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">{plan.kicker}</p>
        )}
        <CardTitle className="text-2xl font-bold text-foreground mb-1">
          {plan.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">{plan.subtitle}</p>
      </CardHeader>

      <CardContent className="p-6 flex flex-col flex-1">
        <div className="mb-6">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-5xl font-black text-foreground">
              {plan.monthlyPrice}€
            </span>
            <span className="text-sm text-muted-foreground">/mois</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">+ {plan.callRate}</p>
        </div>

        <div className="space-y-3 mb-6 pt-1 flex-1">
          {previousPlan && (
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
              Tout pareil que {previousPlan.name} +
            </p>
          )}

          {incrementalFeatures.map((feature) => (
            <div key={`${plan.name}-${feature}`} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <Link href={`/contact?subject=${plan.contactSubject}`} className="mt-auto cursor-pointer">
          <Button
            className={`w-full h-12 font-semibold transition-all ${
              plan.popular
                ? "bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/30"
                : "bg-muted text-foreground hover:bg-muted/80 border border-border"
            }`}
            size="lg"
          >
            {plan.ctaLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
    );
  };

  return (
    <section
      id="pricing"
      className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-border overflow-hidden"
    >
      <DotPatternSubtle className="z-0" patternId="pricing-dot-pattern" />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 -m-8 bg-background rounded-3xl" />
            <div className="relative">
              <Badge className="mb-4 px-4 py-1.5 bg-muted text-foreground border-border">
                Tarification
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Un prix simple et transparent
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-6">
                Trois offres claires, pensées pour votre volume d&apos;appels.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="hidden md:grid relative z-10 grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {PLANS.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
            className="relative"
          >
            {renderPlanCard(plan, index)}
          </motion.div>
        ))}
      </div>

      <div className="md:hidden relative z-10 max-w-sm mx-auto">
        <Carousel
          setApi={setApi}
          opts={{ align: "center", loop: true }}
          plugins={[plugin.current]}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {PLANS.map((plan, index) => (
              <CarouselItem key={plan.name} className="pl-2 basis-full">
                {renderPlanCard(plan, index)}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="flex justify-center gap-2 mt-6">
          {PLANS.map((plan, index) => (
            <button
              key={`dot-${plan.name}`}
              className={`transition-all rounded-full cursor-pointer ${
                selectedIndex === index
                  ? "w-8 h-2 bg-primary"
                  : "w-2 h-2 bg-muted-foreground/30"
              }`}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Aller à la slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

    </section>
  );
}
