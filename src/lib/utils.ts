import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAppUrl(path: string = ""): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  const isLocalhost = 
    (globalThis.window !== undefined && globalThis.window.location.hostname.includes("localhost")) ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "development");
  
  if (isLocalhost) {
    const port = globalThis.window !== undefined && globalThis.window.location.port 
      ? globalThis.window.location.port 
      : "3000";
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
