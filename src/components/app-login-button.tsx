"use client";

import { Button } from "@/components/ui/button";

export function AppLoginButton() {
  const handleLoginClick = () => {
    const hostname = window.location.hostname;
    const port = window.location.port || "3000";
    
    const appUrl = hostname.includes("localhost")
      ? `http://app.localhost:${port}/login`
      : `https://app.yallo.fr/login`;
    
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
