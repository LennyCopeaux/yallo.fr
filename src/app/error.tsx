"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { Phone, AlertCircle, Home, RefreshCw } from "lucide-react";
interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: Readonly<ErrorPageProps>) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-amber-400/15 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-amber-400/5 blur-[100px]" />
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
            <div className="text-9xl font-black text-amber-400 select-none">
              !
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
              <Phone className="w-8 h-8 text-amber-400" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Une erreur est survenue
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
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </motion.div>
          </div>

          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Désolé, une erreur inattendue s&apos;est produite. 
            Notre équipe technique a été automatiquement notifiée et travaille à résoudre le problème.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button 
            onClick={reset} 
            size="lg" 
            className="bg-primary text-black hover:bg-primary/90 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Retour à l&apos;accueil
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="pt-8"
        >
          <p className="text-sm text-muted-foreground">
            Si le problème persiste,{" "}
            <Link href="/contact" className="text-primary hover:underline font-medium">
              contactez notre support
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
