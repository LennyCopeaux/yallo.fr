import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isSupabase = process.env.DATABASE_URL.includes("supabase.co");
const isVercel = !!process.env.VERCEL;

const client = postgres(process.env.DATABASE_URL, {
  // Obligatoire pour pgbouncer (Supabase transaction-mode pooler)
  prepare: false,
  // Supprime la requête d'introspection des types au démarrage de chaque connexion
  fetch_types: false,
  ssl: isSupabase ? "require" : undefined,
  // Vercel serverless : chaque fonction a son propre process → 1 connexion suffit.
  // En local on garde un petit pool pour ne pas ouvrir une connexion à chaque requête.
  max: isVercel ? 1 : 3,
  // Ferme les connexions inactives rapidement (utile en serverless pour ne pas saturer
  // le pooler Supabase, limité à ~25 connexions sur le plan gratuit).
  idle_timeout: isVercel ? 10 : 20,
  // Délai max pour établir une nouvelle connexion (TLS + pgbouncer handshake).
  connect_timeout: 10,
});
export const db = drizzle(client, { schema });
