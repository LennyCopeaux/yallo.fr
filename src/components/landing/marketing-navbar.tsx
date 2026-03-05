"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppLoginButton, MarketingLogoLink } from "@/components/navigation";

const SCROLL_THRESHOLD = 50;

export function MarketingNavbar() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  
  // Sur la page d'accueil, le navbar est masqué au début et apparaît au scroll
  // Sur les autres pages (guide, legal, contact, etc.), il est toujours visible
  // Initialiser directement avec la bonne valeur selon la page
  const [scrolled, setScrolled] = useState(!isHomePage);
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Sur les pages autres que l'accueil, on n'a pas besoin d'écouter le scroll
    if (!isHomePage) {
      startTransition(() => {
        setScrolled(true);
      });
      return;
    }

    const handleScroll = () => {
      startTransition(() => {
        setScrolled(globalThis.window.scrollY > SCROLL_THRESHOLD);
      });
    };

    handleScroll();
    globalThis.window.addEventListener("scroll", handleScroll, { passive: true });
    return () => globalThis.window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHomePage
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="mx-4 mt-4 sm:mx-6 lg:mx-8">
        <div className="glass-strong rounded-2xl border-border">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex h-16 items-center justify-between">
              <MarketingLogoLink />

              <div className="hidden md:flex items-center gap-8">
                <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Comment ça marche
                </Link>
                <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Fonctionnalités
                </Link>
                <Link href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Tarification
                </Link>
                <Link href="/#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  FAQ
                </Link>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <AppLoginButton />
                <Link href="/demo" className="cursor-pointer">
                  <Button size="sm" className="bg-primary text-black hover:bg-primary/90 font-semibold">
                    Démo gratuite
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
