"use client";

import { useSyncExternalStore, useCallback } from "react";

function getHomeUrl(): string {
  if (typeof globalThis.window === "undefined") {
    return "/";
  }
  
  const hostname = globalThis.window.location.hostname;
  const port = globalThis.window.location.port || "3000";
  
  if (hostname === "app.localhost") {
    return `http://localhost:${port}/`;
  }
  if (hostname.includes("staging")) {
    return "https://staging.yallo.fr/";
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
}: Readonly<{ 
  children: React.ReactNode;
  className?: string;
}>) {
  const href = useSyncExternalStore(
    subscribeToNothing,
    useCallback(() => getHomeUrl(), []),
    useCallback(() => "/", [])
  );

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
