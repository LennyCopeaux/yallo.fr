"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DetailPageSkeleton, PageSkeleton } from "@/components/ui/page-skeleton";

function isInternalNavigation(anchor: HTMLAnchorElement, currentPath: string): boolean {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) {
      return false;
    }
    return url.pathname !== currentPath;
  } catch {
    return false;
  }
}

export function InstantNav({
  children,
  variant = "page",
}: Readonly<{
  children: React.ReactNode;
  variant?: "page" | "detail";
}>) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor || !isInternalNavigation(anchor, pathname)) {
        return;
      }

      setPending(true);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  useEffect(() => {
    if (!pending) {
      return;
    }

    const timeout = window.setTimeout(() => setPending(false), 8000);
    return () => window.clearTimeout(timeout);
  }, [pending]);

  if (pending) {
    return variant === "detail" ? <DetailPageSkeleton /> : <PageSkeleton />;
  }

  return children;
}
