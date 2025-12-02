"use client";

import Link from "next/link";

/**
 * Lien vers la page d'accueil du site marketing
 * Détecte automatiquement l'environnement et redirige vers yallo.fr ou localhost
 */
export function MarketingHomeLink({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Détection dynamique de l'environnement depuis le client
    const hostname = window.location.hostname;
    const port = window.location.port || "3000";
    
    let marketingUrl: string;
    
    if (hostname.includes("localhost") || hostname.includes("app.localhost")) {
      // En développement/localhost, rediriger vers localhost (site marketing)
      marketingUrl = `http://localhost:${port}/`;
    } else {
      // En production, rediriger vers yallo.fr (site marketing)
      marketingUrl = `https://yallo.fr/`;
    }
    
    // Redirection vers le site marketing
    window.location.href = marketingUrl;
  };

  return (
    <Link href="#" onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

