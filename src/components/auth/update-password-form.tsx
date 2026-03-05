"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
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
import { Loader2, Lock, Shield, Eye, EyeOff, AlertCircle, Clock } from "lucide-react";
import { updatePassword, verifyResetToken } from "@/app/update-password/actions";
import { toast } from "sonner";

function UpdatePasswordFormContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(!!resetToken);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
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
    async function checkToken() {
      if (!resetToken) {
        setIsVerifyingToken(false);
        return;
      }

      try {
        const result = await verifyResetToken(resetToken);
        if (result.valid && result.email) {
          setIsValidToken(true);
          setUserEmail(result.email);
        } else {
          setError(result.error || "Token invalide ou expiré");
        }
      } catch {
        setError("Erreur lors de la vérification du token");
      } finally {
        setIsVerifyingToken(false);
      }
    }

    if (resetToken) {
      checkToken();
    }
  }, [resetToken]);

  useEffect(() => {
    if (resetToken) return;
    
    if (!isMountedRef.current || status === "loading") return;
    
    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.user.mustChangePassword === false) {
      const redirectPath = session.user.role === "ADMIN" ? "/admin" : "/dashboard";
      router.replace(redirectPath);
    }
  }, [session, status, router, resetToken]);

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

      if (resetToken) {
        formData.append("token", resetToken);
      }

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

  if (isVerifyingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <Card className="w-full max-w-md mx-4 relative z-10 bg-card/50 border-border backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Vérification du token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetToken && !isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-amber-400/10 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-amber-400/5 blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md mx-4 relative z-10"
        >
          <Card className="bg-card/50 border-border backdrop-blur-xl">
            <CardHeader className="text-center space-y-4 pb-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex justify-center"
              >
                <div className="w-20 h-20 rounded-full bg-amber-400/10 flex items-center justify-center">
                  <motion.div
                    animate={{
                      rotate: [0, -10, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: "easeInOut",
                    }}
                  >
                    <Clock className="w-10 h-10 text-amber-400" />
                  </motion.div>
                </div>
              </motion.div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Lien expiré
                </CardTitle>
                <CardDescription className="text-base">
                  {error || "Ce lien de réinitialisation n'est plus valide."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-400/10 border border-amber-400/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-amber-400">Pourquoi ce lien a expiré ?</p>
                    <p className="text-muted-foreground">
                      Les liens de réinitialisation sont valides pendant 1 heure pour des raisons de sécurité. 
                      Si vous avez besoin d&apos;un nouveau lien, contactez votre administrateur.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => router.push("/login")}
                className="w-full !bg-yellow-500 hover:!bg-yellow-600 !text-black"
              >
                Retour à la connexion
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const showSessionLoading = !resetToken && (status === "loading" || !session || session.user.mustChangePassword === false);
  if (showSessionLoading) {
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
                {resetToken 
                  ? `Compte : ${userEmail}`
                  : "Pour des raisons de sécurité, vous devez définir un nouveau mot de passe"
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
            
            {!resetToken && session && (
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Connecté en tant que : <span className="text-foreground font-medium">{session.user.email}</span>
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
