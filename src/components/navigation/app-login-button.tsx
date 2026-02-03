"use client";

import { Button } from "@/components/ui/button";
import { useSyncExternalStore, useCallback } from "react";

function getLoginUrl(): string {
  if (typeof globalThis.window === "undefined") {
    return "/login";
  }
  
  const hostname = globalThis.window.location.hostname;
  const port = globalThis.window.location.port || "3000";
  
  if (hostname === "localhost") {
    return `http://app.localhost:${port}/login`;
  }
  if (hostname.includes("staging")) {
    return "https://app.staging.yallo.fr/login";
  }
  if (hostname.includes("yallo") && !hostname.startsWith("app.")) {
    return "https://app.yallo.fr/login";
  }
  return "/login";
}

function subscribeToNothing() {
  return () => {};
}

export function AppLoginButton() {
  const href = useSyncExternalStore(
    subscribeToNothing,
    useCallback(() => getLoginUrl(), []),
    useCallback(() => "/login", [])
  );

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
