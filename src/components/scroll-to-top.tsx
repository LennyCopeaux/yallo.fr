"use client";

import { useEffect } from "react";

export function ScrollToTop() {
  useEffect(() => {
    const scrollToTop = () => {
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = "";
      }, 0);
    };
    
    scrollToTop();
  }, []);

  return null;
}

