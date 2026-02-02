"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Une erreur est survenue</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Désolé, une erreur inattendue s&apos;est produite. Notre équipe a été notifiée.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>Réessayer</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Retour à l&apos;accueil
        </Button>
      </div>
    </div>
  );
}
