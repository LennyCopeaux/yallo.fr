"use client";

import Link from "next/link";

export function FooterSection() {
  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const port = typeof window !== "undefined" && window.location.port ? window.location.port : "3000";
    const appUrl = hostname.includes("localhost") 
      ? `http://app.localhost:${port}/login`
      : "https://app.yallo.fr/login";
    window.location.href = appUrl;
  };

  return (
    <footer className="relative overflow-hidden">
      {/* Links Grid */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold text-foreground mb-4">Produit</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/#how-it-works" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Tarification
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Légal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/legal" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact?subject=support" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Support Technique
                </Link>
              </li>
              <li>
                <Link href="/contact?subject=autre" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Devenir Partenaire
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Ressources</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  onClick={handleLoginClick}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Connexion
                </a>
              </li>
              <li>
                <Link href="/guide" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Guide de démarrage
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black gradient-text">Yallo</span>
            <span className="text-muted-foreground text-sm">
              © {new Date().getFullYear()}. Tous droits réservés.
            </span>
          </div>
        </div>
      </div>

      {/* Giant YALLO text - behind all content */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0">
        <div 
          className="text-[12rem] sm:text-[18rem] md:text-[24rem] font-black leading-none tracking-tighter whitespace-nowrap"
          style={{ color: 'var(--pattern)', opacity: 0.10 }}
        >
          YALLO
        </div>
      </div>
    </footer>
  );
}
