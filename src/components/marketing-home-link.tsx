"use client";

import { useSyncExternalStore } from "react";

function getHomeUrl(): string {
  if (typeof window === "undefined") {
    return "/";
  }
  
  const hostname = window.location.hostname;
  const port = window.location.port || "3000";
  
  if (hostname === "app.localhost") {
    return `http://localhost:${port}/`;
  }
  if (hostname.startsWith("app.") && hostname.includes("yallo")) {
    return "https://yallo.fr/";
  }
  return "/";
}

function subscribeToNothing() {
  return () => {};
}

export function MarketingHomeLink({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  const href = useSyncExternalStore(
    subscribeToNothing,
    () => getHomeUrl(),
    () => "/"
  );

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
