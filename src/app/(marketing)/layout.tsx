import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppLoginButton } from "@/components/app-login-button";
import { MarketingLogoLink } from "@/components/marketing-logo-link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Floating Navbar - Dark glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4 sm:mx-6 lg:mx-8">
          <div className="glass-strong rounded-2xl border-white/5">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex h-16 items-center justify-between">
                {/* Logo */}
                <MarketingLogoLink />

                {/* Navigation */}
                <div className="hidden md:flex items-center gap-8">
                  <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                    Comment ça marche
                  </Link>
                  <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                    Fonctionnalités
                  </Link>
                  <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                    Tarification
                  </Link>
                  <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                    FAQ
                  </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <AppLoginButton />
                  <Button size="sm" className="bg-[#f6cf62] text-black hover:bg-[#f6cf62]/90 btn-shine font-semibold">
                    Démo gratuite
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative pt-28 sm:pt-32">
        {children}
      </main>
    </div>
  );
}
