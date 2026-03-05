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

const ANNUAL_DISCOUNT = 0.35;

const PLANS = [
  {
    name: "Starter",
    target: "Pour tester l'IA sans risque",
    monthlyPrice: 29,
    commission: "7%",
    minutes: "À la commission",
    popular: false,
    features: [
      "IA Vocale 24/7",
      "Dashboard Tablette",
      "Menu illimité",
      "Support Email",
    ],
  },
  {
    name: "Essential",
    target: "Pour les restaurants en croissance",
    monthlyPrice: 149,
    commission: null,
    minutes: "400 min incluses",
    popular: true,
    features: [
      "IA Vocale 24/7",
      "Dashboard Tablette",
      "Menu illimité",
      "Support Email",
      "Connexion Logiciel de Caisse",
    ],
  },
  {
    name: "Infinity",
    target: "Pour les gros volumes d'appels",
    monthlyPrice: 349,
    commission: null,
    minutes: "1200 min incluses",
    popular: false,
    features: [
      "IA Vocale 24/7",
      "Dashboard Tablette",
      "Menu illimité",
      "Support Prioritaire",
      "Connexion Logiciel de Caisse",
    ],
  },
];

export function PricingSection() {
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "annual">("monthly");
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

  const getPrice = (plan: typeof PLANS[0]) => {
    if (billingCycle === "annual") {
      return Math.round(plan.monthlyPrice * (1 - ANNUAL_DISCOUNT));
    }
    return plan.monthlyPrice;
  };

  const renderPlanCard = (plan: typeof PLANS[0]) => (
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
            Populaire
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-foreground mb-1">
          {plan.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">{plan.target}</p>
      </CardHeader>

      <CardContent className="p-6 flex flex-col flex-1">
        <div className="mb-6">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-5xl font-black text-foreground">
              {getPrice(plan)}€
            </span>
          </div>
          {billingCycle === "annual" && (
            <p className="text-xs text-emerald-600 font-medium mt-1">
              soit {getPrice(plan) * 12}€/an au lieu de {plan.monthlyPrice * 12}€
            </p>
          )}
        </div>

        <div className="mb-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Minutes</span>
            <span className="font-semibold text-foreground">{plan.minutes}</span>
          </div>
          {plan.commission && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Commission</span>
              <span className="font-semibold text-foreground">{plan.commission} / commande</span>
            </div>
          )}
          {!plan.commission && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Commission</span>
              <span className="font-semibold text-emerald-600">Aucune</span>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6 flex-1">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <Link href={`/contact?subject=plan-${plan.name.toLowerCase()}`} className="mt-auto">
          <Button
            className={`w-full h-12 font-semibold transition-all ${
              plan.popular
                ? "bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/30"
                : "bg-muted text-foreground hover:bg-muted/80 border border-border"
            }`}
            size="lg"
          >
            Choisir ce plan
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <section
      id="pricing"
      className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-border overflow-hidden"
    >
      <DotPatternSubtle className="z-0" />

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
                Économisez en payant à l&apos;année.
              </p>

              <div className="inline-flex items-center bg-muted rounded-full p-1 shadow-sm border border-border/50">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                    billingCycle === "monthly"
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    billingCycle === "annual"
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Annuel
                  <span className="text-[11px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                    -35%
                  </span>
                </button>
              </div>
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
            {renderPlanCard(plan)}
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
            {PLANS.map((plan) => (
              <CarouselItem key={plan.name} className="pl-2 basis-full">
                {renderPlanCard(plan)}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        <div className="flex justify-center gap-2 mt-6">
          {PLANS.map((_, index) => (
            <button
              key={`dot-${PLANS[index].name}`}
              className={`transition-all rounded-full ${
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 mt-12 max-w-6xl mx-auto"
      >
        <div className="bg-card border border-border rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-base md:text-lg font-semibold text-foreground mb-2">
                Besoin de plus de puissance ?
              </p>
              <p className="text-sm text-muted-foreground">
                Pour les franchises et restaurants à très fort volume, découvrez notre offre{" "}
                <span className="font-semibold text-foreground">Enterprise</span> sur mesure.
              </p>
            </div>
            <Link href="/contact?subject=enterprise">
              <Button
                variant="outline"
                className="w-full md:w-auto border-primary/50 text-foreground hover:bg-primary/10 hover:border-primary transition-all"
              >
                Nous contacter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
