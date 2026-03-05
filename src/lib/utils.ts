import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAppUrl(path: string = ""): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  const isLocalhost = 
    (globalThis.window?.location?.hostname?.includes("localhost")) ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "development");
  
  if (isLocalhost) {
    const port = globalThis.window?.location?.port ?? "3000";
    return `http://app.localhost:${port}${normalizedPath}`;
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

/**
 * Normalise un numéro de téléphone français au format E.164 (+33XXXXXXXXX)
 * 
 * Accepte :
 * - 0939035299 → +33939035299
 * - +33939035299 → +33939035299 (déjà au bon format)
 * - 00333939035299 → +33939035299
 * - +33 9 39 03 52 99 → +33939035299 (supprime les espaces)
 * 
 * @param phoneNumber - Numéro de téléphone à normaliser
 * @returns Numéro au format E.164 ou null si invalide
 */
export function normalizeFrenchPhoneNumber(phoneNumber: string | null | undefined): string | null {
  if (!phoneNumber) return null;
  
  // Supprime tous les espaces, tirets, points
  let cleaned = phoneNumber.replaceAll(/[\s\-.]/g, "");
  
  // Si déjà au format +33, retourne tel quel après nettoyage
  if (cleaned.startsWith("+33")) {
    return cleaned;
  }
  
  // Si commence par 0033 (format international avec 00), remplace par +33
  if (cleaned.startsWith("0033")) {
    cleaned = "+33" + cleaned.slice(4);
    return cleaned;
  }
  
  // Si commence par 0 (format français local), remplace par +33
  if (cleaned.startsWith("0")) {
    cleaned = "+33" + cleaned.slice(1);
    return cleaned;
  }
  
  // Si commence directement par 33 (sans + ni 0), ajoute le +
  if (cleaned.startsWith("33") && cleaned.length >= 11) {
    return "+" + cleaned;
  }
  
  // Si aucun pattern reconnu, retourne null
  return null;
}
