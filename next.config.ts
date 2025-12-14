import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Autoriser la navigation entre sous-domaines en dev
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://app.localhost:3000",
  ],
};

export default nextConfig;
