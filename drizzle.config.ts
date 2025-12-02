import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Charge .env.local pour drizzle-kit
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

