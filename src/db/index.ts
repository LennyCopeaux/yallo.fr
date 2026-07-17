import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  ssl: process.env.DATABASE_URL?.includes("supabase.co") ? "require" : undefined,
  connect_timeout: 10,
  idle_timeout: 20,
  max: 10,
});
export const db = drizzle(client, { schema });
