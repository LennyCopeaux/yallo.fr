import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isSupabase = process.env.DATABASE_URL.includes("supabase.co");

const client = postgres(process.env.DATABASE_URL, {
  // Supabase pooler (pgbouncer) : pas de prepared statements, pas d'introspection de types.
  // fetch_types:false supprime une requête d'introspection à chaque nouvelle connexion
  // (gain réseau important, surtout quand la latence vers le pooler est élevée).
  prepare: false,
  fetch_types: false,
  ssl: isSupabase ? "require" : undefined,
  connect_timeout: 15,
  // Une seule connexion réutilisée et gardée chaude : évite de refaire un
  // handshake TLS + pooler à chaque requête (cause des CONNECT_TIMEOUT en dev).
  max: 1,
  idle_timeout: 30,
});
export const db = drizzle(client, { schema });
