"use client";

import * as React from "react";
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
  X,
  Clock,
  Smartphone,
  Tablet,
  Settings,
  Mail,
  Link2,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";

type PricingPlan = {
  id: string;
  name: string;
  subtitle: string;
  target: string;
  monthlyPrice: number;
  setupFee: number | null;
  commissionRate: number | null;
  includedMinutes: number | null;
  overflowPricePerMinute: number | null;
  hubrise: boolean;
  popular: boolean;
};

interface PricingSectionProps {
  pricingPlans: PricingPlan[];
}

function formatPrice(priceInCents: number): string {
  const price = priceInCents / 100;
  // Formater avec 2 décimales si nécessaire, sinon nombre entier
  return price % 1 === 0 ? price.toString() : price.toFixed(2).replace(".", ",");
}

function getSupportText(planName: string): string {
  if (planName === "infinity") {
    return "Support Prioritaire";
  }
  return "Support Email Réactif";
}

export function PricingSection({ pricingPlans }: Readonly<PricingSectionProps>) {
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

  // Transformer les plans de la BDD en format pour l'affichage
  const plans = pricingPlans.map((plan) => {
    const contactSubject = `plan-${plan.name}`;
    const minutes = plan.includedMinutes !== null ? plan.includedMinutes : "Illimitées";
    const overflowPrice = plan.overflowPricePerMinute !== null 
      ? `${formatPrice(plan.overflowPricePerMinute)}€`
      : null;
    const setupFee = plan.setupFee !== null 
      ? `${plan.setupFee / 100}€ (Offerts si engagement)`
      : undefined;

    return {
      ...plan,
      price: plan.monthlyPrice / 100,
      commission: plan.commissionRate ?? 0,
      minutes,
      overflowPrice,
      contactSubject,
      setupFee,
      support: getSupportText(plan.name),
    };
  });

  const renderPlanCard = (plan: typeof plans[0]) => (
    <>
      <Card
        className={`relative glass-strong overflow-hidden noise h-full flex flex-col transition-all ${
          plan.popular
            ? "md:border-4 border-2 md:shadow-2xl md:shadow-primary/40 border-primary"
            : "border-2 border-border"
        }`}
        style={{
          background: `linear-gradient(135deg, hsl(var(--card) / 0.9) 0%, hsl(var(--card) / 0.7) 100%)`,
        }}
      >
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--pattern)) 1px, transparent 0)`,
                  backgroundSize: "20px 20px",
                }}
              />

              {plan.popular && (
                <div className="absolute top-4 right-4 z-20 hidden md:block">
                  <Badge className="bg-primary text-black border-primary px-3 py-1 font-semibold shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    Populaire
                  </Badge>
                </div>
              )}

              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="text-2xl font-bold text-foreground mb-1">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {plan.subtitle}
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-2">{plan.target}</p>
              </CardHeader>

              <CardContent className="relative z-10 p-6 flex flex-col flex-1">
                <div className="space-y-4 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-foreground">
                      {plan.price}€
                    </span>
                    <span className="text-muted-foreground text-lg">/mois</span>
                  </div>

                  {plan.setupFee && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        Frais de mise en service :
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {plan.setupFee}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Commission</span>
                      <span className="font-semibold text-foreground">
                        {plan.commission > 0 ? `${plan.commission}%` : "0%"} / commande
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {typeof plan.minutes === "number" ? "Minutes incluses" : "Minutes"}
                      </span>
                      <span className={`font-semibold ${
                        typeof plan.minutes === "string" && plan.minutes === "Illimitées"
                          ? "text-emerald-500 font-bold"
                          : "text-foreground"
                      }`}>
                        {typeof plan.minutes === "number"
                          ? `${plan.minutes} min`
                          : plan.minutes}
                      </span>
                    </div>

                    {plan.overflowPrice && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Coût min sup</span>
                        <span className="font-semibold text-foreground">
                          {plan.overflowPrice}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm pt-3 border-t border-border/50">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-muted-foreground flex items-center gap-1.5 cursor-help">
                            <Link2 className="w-4 h-4" />
                            Connexion Logiciel de Caisse
                            <Info className="w-3 h-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>via HubRise</p>
                        </TooltipContent>
                      </Tooltip>
                      {plan.hubrise ? (
                        <Check className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-start gap-2 text-xs">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">IA Vocale 24/7</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Dashboard Tablette</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Menu illimité</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{plan.support}</span>
                  </div>
                </div>

                <Link href={`/contact?subject=${plan.contactSubject}`} className="mt-auto">
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
    </>
  );

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

      {/* Desktop: Grid */}
      <div className="hidden md:grid relative z-10 grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
            className={`relative ${
              plan.popular 
                ? "z-20 md:scale-105" 
                : "z-10 md:mt-[2.5%]"
            }`}
          >
            {plan.popular && (
              <div className="absolute -inset-1 bg-primary/30 rounded-3xl blur-2xl opacity-60" />
            )}
            {renderPlanCard(plan)}
          </motion.div>
        ))}
      </div>

      {/* Mobile: Carousel */}
      <div className="md:hidden relative z-10 max-w-sm mx-auto">
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
          plugins={[plugin.current]}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {plans.map((plan) => (
              <CarouselItem key={plan.name} className="pl-2 basis-full">
                <div className="relative">
                  {renderPlanCard(plan)}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        {/* Indicateurs de pagination */}
        <div className="flex justify-center gap-2 mt-6">
          {plans.map((_, index) => (
            <button
              key={index}
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

      {/* Section Enterprise */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 mt-12 max-w-6xl mx-auto"
      >
        <div className="bg-muted/30 border border-border/50 rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-base md:text-lg font-semibold text-foreground mb-2">
                🚀 Besoin de plus de puissance ?
              </p>
              <p className="text-sm text-muted-foreground">
                Pour les franchises et les restaurants à très fort volume (&gt; 40 appels / jour), découvrez notre offre{" "}
                <span className="font-semibold text-foreground">Enterprise</span> avec minutes illimitées et support dédié.
              </p>
            </div>
            <Link href="/contact?subject=enterprise">
              <Button
                variant="outline"
                className="w-full md:w-auto border-primary/50 text-foreground hover:bg-primary/10 hover:border-primary transition-all"
              >
                Contacter l&apos;équipe commerciale
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
