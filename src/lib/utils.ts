import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAppUrl(path: string = ""): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  const isLocalhost = 
    (typeof window !== "undefined" && window.location.hostname.includes("localhost")) ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "development");
  
  if (isLocalhost) {
    const port = typeof window !== "undefined" && window.location.port 
      ? window.location.port 
      : "3000";
    return `http://app.localhost:${port}${normalizedPath}`;
  }
  
  return `https://app.yallo.fr${normalizedPath}`;
}

export function buildAppUrlServer(pathname: string, host: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const isDev = host.includes("localhost");
  
  if (isDev) {
    const port = host.split(":")[1] || "3000";
    return `http://app.localhost:${port}${normalizedPath}`;
  }
  
  return `https://app.yallo.fr${normalizedPath}`;
}
