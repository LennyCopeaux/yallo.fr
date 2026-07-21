import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Vitest 4 : 1 seul worker. Le parallélisme (threads/forks) timeout au
    // démarrage sur cette machine avec coverage v8.
    pool: "forks",
    maxWorkers: 1,
    fileParallelism: false,
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", ".next", "drizzle"],
    env: {
      DATABASE_URL: "postgresql://postgres@localhost/test",
    },
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
