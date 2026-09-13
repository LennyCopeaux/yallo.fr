"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { cn, getAppUrl } from "@/lib/utils";
import {
  LayoutDashboard,
  Utensils,
  Clock,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Store,
  ChevronDown,
  Check,
  ShoppingBag,
  Building2,
  CreditCard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { switchRestaurant } from "@/features/restaurant/switch-actions";

const BILLING_HREF = "/dashboard/billing";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Commandes", href: "/dashboard/orders", icon: ShoppingBag },
  { name: "Menu", href: "/dashboard/menu", icon: Utensils },
  { name: "Horaires", href: "/dashboard/hours", icon: Clock },
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
  { name: "Abonnement", href: BILLING_HREF, icon: CreditCard },
] as const;

async function handleLogout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  if (globalThis.window !== undefined) {
    globalThis.window.location.href = getAppUrl("/login");
  }
}

interface ClientSidebarProps {
  hasHubriseConfig: boolean;
  restaurants: { id: string; name: string }[];
  currentRestaurantId: string | null;
  orgId?: string | null;
  orgName?: string | null;
  userRole?: string;
  subscriptionLocked?: boolean;
}

export function ClientSidebar({ hasHubriseConfig, restaurants, currentRestaurantId, orgId, orgName, userRole, subscriptionLocked = false }: Readonly<ClientSidebarProps>) {
  const [expanded, setExpanded] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(currentRestaurantId);
  const [, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  const currentRestaurant = restaurants.find((r) => r.id === activeRestaurantId) ?? restaurants[0] ?? null;
  const hasMultipleRestaurants = restaurants.length > 1;
  const orgNavigation = orgId
    ? [
        { name: "Dashboard organisation", href: `/org/${orgId}`, icon: Building2 },
      ]
    : [];

  function handleSwitchRestaurant(id: string) {
    setSelectorOpen(false);
    setActiveRestaurantId(id);
    startTransition(async () => {
      await switchRestaurant(id);
      router.refresh();
    });
  }

  const visibleNavigation = navigation.filter((item) => {
    if (hasHubriseConfig && item.href === "/dashboard/menu") {
      return false;
    }

    if (userRole === "EMPLOYEE") {
      return item.href === "/dashboard" || item.href === "/dashboard/orders";
    }

    // Abonnement inactif : seule la page de souscription reste atteignable.
    if (subscriptionLocked) {
      return item.href === BILLING_HREF;
    }

    return true;
  });

  const orgHeaderLabel = orgName ?? "Organisation";

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen flex flex-col bg-background border-r border-border transition-all duration-300 shrink-0 z-40",
        expanded ? "w-56" : "w-16"
      )}
    >
      {}
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

      {}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {orgNavigation.length > 0 && expanded && (
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
            Niveau organisation
          </p>
        )}

        {orgNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
                    key={`org-nav-${item.href}`}
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

        {orgNavigation.length > 0 && (
          <div className="h-px bg-border mx-2 my-1" />
        )}

        {expanded && (
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
            Niveau restaurant
          </p>
        )}

        {hasMultipleRestaurants && currentRestaurant ? (
          <div className="px-1 pb-1 relative">
            <button
              onClick={() => setSelectorOpen(!selectorOpen)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                !expanded && "justify-center"
              )}
              aria-label="Changer de restaurant"
            >
              <Store className="w-4 h-4 shrink-0" />
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.span
                    key="restaurant-name"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 text-left truncate whitespace-nowrap overflow-hidden text-foreground font-semibold"
                  >
                    {currentRestaurant.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {expanded && <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {selectorOpen && expanded && (
                <motion.div
                  key="restaurant-dropdown"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1 right-1 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg overflow-hidden"
                >
                  {restaurants.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSwitchRestaurant(r.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <span className="flex-1 text-left truncate">{r.name}</span>
                      {r.id === currentRestaurant.id && (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          expanded && (
            <p className="px-3 py-2 text-xs text-muted-foreground truncate">
              {currentRestaurant?.name ?? orgHeaderLabel}
            </p>
          )
        )}

        {visibleNavigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");
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

      {}
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
