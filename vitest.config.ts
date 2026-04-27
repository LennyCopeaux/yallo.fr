import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", ".next", "drizzle"],
    env: {
      DATABASE_URL: "postgresql://postgres@localhost/test",
    },
    environmentMatchGlobs: [
      // Testes que usam database/server features rodym em ambiente node
      ["src/__tests__/features/**/*.test.ts", "node"],
      ["src/__tests__/app/**/*.test.ts", "node"],
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/**",
        ".next/**",
        "drizzle/**",
        "**/*.config.*",
        "src/__tests__/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
