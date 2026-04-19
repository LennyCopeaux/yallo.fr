"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { cn, getAppUrl } from "@/lib/utils";
import {
  LayoutDashboard,
  Utensils,
  Clock,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Menu", href: "/dashboard/menu", icon: Utensils },
  { name: "Horaires", href: "/dashboard/hours", icon: Clock },
] as const;

async function handleLogout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  if (globalThis.window !== undefined) {
    globalThis.window.location.href = getAppUrl("/login");
  }
}

export function ClientSidebar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen flex flex-col bg-background border-r border-border transition-all duration-300 shrink-0 z-40",
        expanded ? "w-56" : "w-16"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.span
              key="logo"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-black gradient-text"
            >
              Yallo
            </motion.span>
          )}
        </AnimatePresence>

        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            !expanded && "mx-auto"
          )}
          aria-label={expanded ? "Réduire le menu" : "Déplier le menu"}
        >
          {expanded ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "group-hover:text-foreground"
                )}
              />
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.span
                    key={`label-${item.href}`}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Footer – logout */}
      <div className="p-2 border-t border-border shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors group"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.span
                key="logout-label"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Déconnexion
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </aside>
  );
}
