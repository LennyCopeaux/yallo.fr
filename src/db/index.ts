import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isSupabase = process.env.DATABASE_URL.includes("supabase.co");

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  fetch_types: false,
  ssl: isSupabase ? "require" : undefined,
  connect_timeout: 15,
  max: process.env.VERCEL ? 1 : 5,
  idle_timeout: 30,
});
export const db = drizzle(client, { schema });
