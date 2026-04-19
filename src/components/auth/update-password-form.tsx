"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Loader2, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { updatePassword } from "@/app/update-password/actions";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

function UpdatePasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRecoveryToken = searchParams.get("type") === "recovery";

  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setIsLoadingUser(false);

      if (!data.user && !hasRecoveryToken) {
        router.replace("/login");
      }
    }
    loadUser();
  }, [router, hasRecoveryToken]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      toast.success("Mot de passe changé avec succès", {
        description: "Vous allez être redirigé...",
        duration: 2000,
      });

      const result = await updatePassword(formData);

      if (!result.success) {
        setError(result.error || "Une erreur est survenue");
        setIsLoading(false);
      }
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "digest" in err &&
        typeof (err as { digest: string }).digest === "string" &&
        (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
      ) {
        return;
      }
      setError("Une erreur est survenue");
      setIsLoading(false);
    }
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-md mx-4 relative z-10">
        <Card className="bg-card/50 border-border backdrop-blur-xl">
          <CardHeader className="text-center space-y-4 pb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-foreground">
                Changer votre mot de passe
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                {user
                  ? `Compte : ${user.email}`
                  : "Définissez un nouveau mot de passe"
                }
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 h-11 pr-10"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 6 caractères
              </p>
              </div>
              <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 h-11 pr-10"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
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
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour le mot de passe"
                )}
              </Button>
            </form>
            
            {user && (
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Connecté en tant que : <span className="text-foreground font-medium">{user.email}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function UpdatePasswordForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <UpdatePasswordFormContent />
    </Suspense>
  );
}
