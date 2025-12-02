"use client";

import Link from "next/link";

export function MarketingLogoLink() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "instant" });
    window.location.href = "/";
  };

  return (
    <Link href="/" onClick={handleClick} className="flex items-center gap-2">
      <span className="text-2xl sm:text-3xl font-black gradient-text">
        Yallo
      </span>
    </Link>
  );
}

