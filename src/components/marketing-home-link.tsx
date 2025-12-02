"use client";

import Link from "next/link";

export function MarketingHomeLink({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    const hostname = window.location.hostname;
    const port = window.location.port || "3000";
    
    const marketingUrl = hostname.includes("localhost") || hostname.includes("app.localhost")
      ? `http://localhost:${port}/`
      : `https://yallo.fr/`;
    
    window.location.href = marketingUrl;
  };

  return (
    <Link href="#" onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
