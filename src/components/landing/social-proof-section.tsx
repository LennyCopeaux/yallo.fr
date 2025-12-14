"use client";

import { motion } from "motion/react";
import {
  UtensilsCrossed,
  Pizza,
  ChefHat,
  Coffee,
} from "lucide-react";

const restaurantTypes = [
  { icon: UtensilsCrossed, label: "Kebab" },
  { icon: Pizza, label: "Pizzeria" },
  { icon: ChefHat, label: "Burger" },
  { icon: Coffee, label: "Asiatique" },
  { icon: UtensilsCrossed, label: "Tacos" },
  { icon: ChefHat, label: "Sushi" },
  { icon: Pizza, label: "Fast Food" },
  { icon: Coffee, label: "Grec" },
  { icon: UtensilsCrossed, label: "Döner" },
  { icon: Pizza, label: "Poke Bowl" },
  { icon: ChefHat, label: "Naan" },
  { icon: Coffee, label: "Thaï" },
  { icon: UtensilsCrossed, label: "Sandwich" },
  { icon: Pizza, label: "Wrap" },
  { icon: ChefHat, label: "Wings" },
  { icon: Coffee, label: "Bagel" },
];

export function SocialProofSection() {
  return (
    <section className="py-8 border-y border-border overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-xs text-muted-foreground mb-5 uppercase tracking-wider font-medium text-center">
          Conçu pour votre restaurant
        </p>
        
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="flex overflow-hidden">
            <motion.div
              className="flex gap-4"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                x: {
                  repeat: 9999,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
            >
              {[...restaurantTypes, ...restaurantTypes].map((type, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-border/50 bg-card/20 hover:border-primary hover:bg-primary/10 transition-all duration-300 cursor-default group shrink-0"
                >
                  <type.icon className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-muted-foreground/60 group-hover:text-primary transition-colors whitespace-nowrap">
                    {type.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
