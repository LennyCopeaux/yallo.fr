"use client";

import { useState } from "react";
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { MarketingHomeLink } from "@/components/marketing-home-link";
import { ModeToggle } from "@/components/mode-toggle";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
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
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <ModeToggle />
      </div>

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
        
        {/* Grid overlay - Light mode */}
        <div 
          className="absolute inset-0 dark:hidden"
          style={{ 
            backgroundImage: 'linear-gradient(hsl(var(--foreground) / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.08) 1px, transparent 1px)',
            backgroundSize: '64px 64px'
          }}
        />
        {/* Grid overlay - Dark mode */}
        <div 
          className="absolute inset-0 hidden dark:block"
          style={{ 
            backgroundImage: 'linear-gradient(hsl(var(--foreground) / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.15) 1px, transparent 1px)',
            backgroundSize: '64px 64px'
          }}
        />
      </div>

      <Card className="w-full max-w-md mx-4 relative z-10 bg-card/50 border-border backdrop-blur-xl noise">
        <CardHeader className="text-center space-y-2 pb-2">
          <Link href="/" className="inline-block">
            <CardTitle className="text-3xl font-black gradient-text">
              Yallo
            </CardTitle>
          </Link>
          <CardDescription className="text-muted-foreground">
            Connectez-vous à votre espace
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="text-sm text-center bg-destructive/10 text-destructive p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full h-11 bg-primary text-black hover:bg-primary/90 font-semibold btn-shine"
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
  );
}
