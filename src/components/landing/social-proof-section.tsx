"use client";

import {
  UtensilsCrossed,
  Pizza,
  ChefHat,
  Coffee,
  Fish,
  Sandwich,
} from "lucide-react";

const restaurantTypes = [
  { icon: UtensilsCrossed, label: "Kebab" },
  { icon: Pizza, label: "Pizzeria" },
  { icon: ChefHat, label: "Burger" },
  { icon: Coffee, label: "Asiatique" },
  { icon: UtensilsCrossed, label: "Tacos" },
  { icon: Fish, label: "Sushi" },
  { icon: Pizza, label: "Fast Food" },
  { icon: Coffee, label: "Poke Bowl" },
  { icon: ChefHat, label: "Naan" },
  { icon: Sandwich, label: "Sandwich" },
  { icon: UtensilsCrossed, label: "Wings" },
  { icon: Coffee, label: "Thaï" },
  { icon: ChefHat, label: "Döner" },
  { icon: Pizza, label: "Wrap" },
  { icon: Fish, label: "Poké" },
  { icon: Sandwich, label: "Bagel" },
];

function MarqueeRow() {
  return (
    <div className="flex gap-4 shrink-0 animate-marquee">
      {restaurantTypes.map((type, i) => (
        <div
          key={`marquee-${type.label}-${i}`}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-border/50 bg-card/20 hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-default shrink-0"
        >
          <type.icon className="w-4 h-4 text-muted-foreground/60" />
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {type.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SocialProofSection() {
  return (
    <section className="py-8 border-y border-border overflow-hidden">
      <p className="text-xs text-muted-foreground mb-5 uppercase tracking-wider font-medium text-center">
        Conçu pour votre restaurant
      </p>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 w-max">
          <MarqueeRow />
          <MarqueeRow />
        </div>
      </div>
    </section>
  );
}
