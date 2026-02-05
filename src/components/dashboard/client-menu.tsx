"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  Utensils,
  Clock,
  LogOut,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { signOut } from "next-auth/react";
import { getAppUrl } from "@/lib/utils";

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => Promise<void>;
};

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Menu", href: "/dashboard/menu", icon: Utensils },
  { name: "Horaires", href: "/dashboard/hours", icon: Clock },
];

async function handleLogout(): Promise<void> {
  await signOut({ redirect: false });
  
  if (typeof window !== "undefined") {
    const loginUrl = getAppUrl("/login");
    window.location.href = loginUrl;
  }
}

interface ClientMenuProps {
  hasHubRise: boolean; // Gardé pour compatibilité mais non utilisé maintenant
}

export function ClientMenu({ hasHubRise }: ClientMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const allItems: NavigationItem[] = [
    ...navigation,
    { name: "Déconnexion", href: "#", icon: LogOut, action: handleLogout }
  ];

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* Desktop */}
      <div ref={menuRef} className="hidden md:block fixed left-2 bottom-0 z-50">
        {/* Bouton jaune - toujours visible, collé en bas */}
        <motion.button
          whileHover={!isOpen ? { scale: 1.05 } : undefined}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-20 h-8 rounded-t-xl bg-primary shadow-lg flex items-center justify-center"
          style={{ transformOrigin: "bottom center" }}
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-black" />
          ) : (
            <ChevronUp className="w-4 h-4 text-black" />
          )}
        </motion.button>

        {/* Menu blanc - s'affiche en dessous du bouton, pousse tout vers le haut */}
        <motion.div
          initial={false}
          animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="overflow-hidden bg-background/98 backdrop-blur-xl border border-border/50 rounded-b-xl rounded-tr-xl shadow-xl"
        >
          <div className="px-3 py-2 flex flex-row items-center gap-1">
            {allItems.map((item) => {
              const isActive = item.href !== "#" && pathname === item.href;

              if (item.action) {
                return (
                  <button
                    key={item.name}
                    onClick={item.action}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                      "hover:bg-primary/10",
                      isActive && "bg-primary text-black"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                    "hover:bg-primary/10",
                    isActive && "bg-primary text-black"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Mobile - barre fixe en bas */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-t border-border shadow-xl">
        <div className="flex items-center justify-around py-2 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-lg",
                  "hover:bg-primary/10",
                  isActive && "bg-primary text-black"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "scale-110")} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-lg",
              "hover:bg-primary/10"
            )}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
}
