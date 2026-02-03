"use client";

import { useEffect, useState } from "react";

export function MarketingHomeLink({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  const [href, setHref] = useState("/");

  useEffect(() => {
    const hostname = window.location.hostname;
    const port = window.location.port || "3000";
    
    if (hostname === "app.localhost") {
      setHref(`http://localhost:${port}/`);
    } else if (hostname.startsWith("app.") && hostname.includes("yallo")) {
      setHref("https://yallo.fr/");
    } else {
      setHref("/");
    }
  }, []);

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
