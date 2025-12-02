import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Génère l'URL absolue pour le sous-domaine App
 * @param path - Le chemin relatif (ex: "/login", "/dashboard")
 * @returns L'URL absolue du sous-domaine App
 */
export function getAppUrl(path: string = ""): string {
  // Normaliser le path (ajouter / au début si absent)
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // Détection dynamique : vérifier si on est en localhost (client ou serveur)
  const isLocalhost = 
    (typeof window !== "undefined" && window.location.hostname.includes("localhost")) ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "development");
  
  if (isLocalhost) {
    // En développement/localhost, utiliser app.localhost:3000
    // Récupérer le port depuis window.location si disponible, sinon utiliser 3000
    const port = typeof window !== "undefined" && window.location.port 
      ? window.location.port 
      : "3000";
    return `http://app.localhost:${port}${normalizedPath}`;
  }
  
  // En production, utiliser app.yallo.fr
  return `https://app.yallo.fr${normalizedPath}`;
}
