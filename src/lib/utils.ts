import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAppUrl(path: string = ""): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof globalThis.window !== "undefined") {
    const hostname = globalThis.window.location.hostname;
    const port = globalThis.window.location.port;

    if (hostname.includes("localhost")) {
      return `http://app.localhost:${port || "3000"}${normalizedPath}`;
    }
    if (hostname.includes("staging")) {
      return `https://app.staging.yallo.fr${normalizedPath}`;
    }
    return `https://app.yallo.fr${normalizedPath}`;
  }

  const isLocalhost =
    typeof process !== "undefined" && process.env.NODE_ENV === "development";

  if (isLocalhost) {
    return `http://app.localhost:3000${normalizedPath}`;
  }

  return `https://app.yallo.fr${normalizedPath}`;
}

export function buildAppUrlServer(pathname: string, host: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}${normalizedPath}`;
  }

  const isDev = host.includes("localhost");

  if (isDev) {
    const port = host.split(":")[1] || "3000";
    return `http://app.localhost:${port}${normalizedPath}`;
  }

  const isStaging = host.includes("staging");
  if (isStaging) {
    return `https://app.staging.yallo.fr${normalizedPath}`;
  }

  return `https://app.yallo.fr${normalizedPath}`;
}

export function normalizeFrenchPhoneNumber(phoneNumber: string | null | undefined): string | null {
  if (!phoneNumber) return null;

  let cleaned = phoneNumber.replaceAll(/[\s\-.]/g, "");

  if (cleaned.startsWith("+33")) {
    return cleaned;
  }

  if (cleaned.startsWith("0033")) {
    cleaned = "+33" + cleaned.slice(4);
    return cleaned;
  }

  if (cleaned.startsWith("0")) {
    cleaned = "+33" + cleaned.slice(1);
    return cleaned;
  }

  if (cleaned.startsWith("33") && cleaned.length >= 11) {
    return "+" + cleaned;
  }

  return null;
}

export function toFrenchLocalPhoneNumber(phoneNumber: string | null | undefined): string | null {
  const e164 = normalizeFrenchPhoneNumber(phoneNumber);
  if (!e164 || !e164.startsWith("+33") || e164.length < 12) return null;
  return `0${e164.slice(3)}`;
}
