"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Phone } from "lucide-react";
import { MarketingHomeLink } from "@/components/navigation";
import { DotPatternSubtle } from "@/components/ui/dot-pattern";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
        setIsLoading(false);
        return;
      }

      router.push("/api/auth/redirect");
    } catch {
      setError("Une erreur est survenue");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <DotPatternSubtle className="z-0" />

      <div className="w-full max-w-md mx-4 relative z-10">
        <Card className="bg-card/50 border-border backdrop-blur-xl">
          <CardHeader className="text-center space-y-4 pb-4">
            <div>
              <Link href="/" className="inline-block">
                <CardTitle className="text-4xl font-black gradient-text">
                  Yallo
                </CardTitle>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-2">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
              >
                <Phone className="w-5 h-5 text-primary" />
              </motion.div>
              <CardDescription className="text-muted-foreground text-base">
                Connectez-vous à votre espace
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading}
                className="bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-sm text-center bg-destructive/10 text-destructive p-3 rounded-lg border border-destructive/20"
                >
                  {error}
                </motion.div>
              )}
              
              <Button
                type="submit"
                className="w-full h-11 bg-primary text-black hover:bg-primary/90 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <MarketingHomeLink className="text-sm text-muted-foreground hover:text-primary transition-colors">
                ← Retour à l&apos;accueil
              </MarketingHomeLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
