"use client";

import { usePathname } from "next/navigation";
import { MarketingNavbar } from "@/components/landing/marketing-navbar";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const mainPaddingTop = isHomePage ? "" : "pt-24 sm:pt-28";

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <MarketingNavbar />

      <main className={`relative ${mainPaddingTop}`}>
        {children}
      </main>
    </div>
  );
}
