"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => Promise<void>;
};

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Paramètres", href: "/admin/settings", icon: Settings },
];

async function handleLogout(): Promise<void> {
  await signOut({ redirect: false });
  
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const port = window.location.port || "3000";
    
    let loginUrl: string;
    if (hostname.includes("localhost")) {
      loginUrl = `http://app.localhost:${port}/login`;
    } else if (hostname.includes("staging")) {
      loginUrl = "https://app.staging.yallo.fr/login";
    } else {
      loginUrl = "https://app.yallo.fr/login";
    }
    
    window.location.href = loginUrl;
  }
}

export function AdminMenu() {
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
              const isActive = item.href !== "#" && (
                pathname === item.href || 
                (item.href !== "/admin" && pathname.startsWith(item.href))
              );

              if (item.action) {
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    onClick={item.action}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                      "hover:bg-primary/10",
                      isActive && "bg-primary text-black"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Button>
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
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));

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
        </div>
      </div>
    </>
  );
}
