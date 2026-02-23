"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone, UtensilsCrossed, Home } from "lucide-react";
import { ModeToggle } from "@/components/navigation";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ModeToggle />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
            className="inline-block"
          >
            <div className="text-9xl font-black gradient-text select-none">
              404
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{
                rotate: [0, -15, 15, -15, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
            >
              <Phone className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Oups, cette page n&apos;existe pas !
            </h1>
            <motion.div
              animate={{
                rotate: [0, 15, -15, 15, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
            >
              <UtensilsCrossed className="w-8 h-8 text-primary" />
            </motion.div>
          </div>

          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Cette page semble avoir disparu du menu. 
            Elle a peut-être été déplacée ou retirée du service.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button asChild size="lg" className="bg-primary text-black hover:bg-primary/90">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Retour à l&apos;accueil
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Nous contacter
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
