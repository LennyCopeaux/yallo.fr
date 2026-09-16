import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
    // Par défaut Next ne réutilise jamais une page dynamique déjà chargée
    // (dynamic: 0) : chaque retour sur /dashboard relançait le rendu complet.
    // 30 s couvre la navigation entre onglets ; les actions serveur invalident
    // quand même via revalidatePath.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://app.localhost:3000",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
