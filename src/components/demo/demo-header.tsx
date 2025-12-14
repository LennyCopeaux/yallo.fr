"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface DemoHeaderProps {
  children: React.ReactNode;
}

export function DemoHeader({ children }: DemoHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Démo gratuite
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Testez Yallo en direct
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Appelez notre numéro de démonstration et commandez comme un vrai client.
          <br />
          <span className="font-semibold text-primary">30 secondes gratuites</span> pour découvrir l&apos;IA en action.
        </p>
      </div>
      {children}
    </motion.div>
  );
}
