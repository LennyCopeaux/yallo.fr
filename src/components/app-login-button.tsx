"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function AppLoginButton() {
  const [href, setHref] = useState("/login");

  useEffect(() => {
    const hostname = window.location.hostname;
    const port = window.location.port || "3000";
    
    if (hostname === "localhost") {
      setHref(`http://app.localhost:${port}/login`);
    } else if (hostname.includes("yallo") && !hostname.startsWith("app.")) {
      setHref("https://app.yallo.fr/login");
    } else {
      setHref("/login");
    }
  }, []);

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="hidden sm:flex text-muted-foreground hover:text-foreground hover:bg-accent"
      asChild
    >
      <a href={href}>Connexion</a>
    </Button>
  );
}
