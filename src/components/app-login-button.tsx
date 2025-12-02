"use client";

import { Button } from "@/components/ui/button";

/**
 * Bouton de connexion qui redirige vers le sous-domaine App
 * Détecte automatiquement l'environnement (localhost vs production)
 */
export function AppLoginButton() {
  const handleLoginClick = () => {
    // Détection dynamique de l'environnement depuis le client
    const hostname = window.location.hostname;
    const port = window.location.port || "3000";
    
    let appUrl: string;
    
    if (hostname.includes("localhost")) {
      // En développement/localhost
      appUrl = `http://app.localhost:${port}/login`;
    } else {
      // En production
      appUrl = `https://app.yallo.fr/login`;
    }
    
    // Redirection vers le sous-domaine App
    window.location.href = appUrl;
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="hidden sm:flex text-muted-foreground hover:text-white"
      onClick={handleLoginClick}
    >
      Connexion
    </Button>
  );
}

