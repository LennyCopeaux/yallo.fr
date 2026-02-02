"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: Readonly<ErrorPageProps>) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  const handleHomeClick = () => {
    globalThis.window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Une erreur est survenue</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Désolé, une erreur inattendue s&apos;est produite. Notre équipe a été notifiée.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>Réessayer</Button>
        <Button variant="outline" onClick={handleHomeClick}>
          Retour à l&apos;accueil
        </Button>
      </div>
    </div>
  );
}
