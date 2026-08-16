import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const databaseUrl = process.env.DATABASE_URL;
const isSupabase = databaseUrl.includes("supabase.co");
const isVercel = !!process.env.VERCEL;

/**
 * Supabase expose deux poolers :
 *   :5432 = session mode   -> stable avec postgres.js quel que soit `max`
 *   :6543 = transaction mode -> DEADLOCK des que le pool doit mettre une requete
 *                               en file d'attente (concurrence > max).
 *
 * Mesure sur ce projet (10 runs x 5 requetes concurrentes, comme la page /admin) :
 *   :6543 max=1/2/3 -> 10/10 blocages    | max=5/10 -> stable
 *   :5432 max=1/3/5/10 -> stable dans tous les cas
 *
 * On utilise donc le session pooler. Si l'URL pointe malgre tout vers :6543,
 * on force un pool assez large pour qu'aucune requete ne soit jamais mise en
 * attente, sinon la page se figerait jusqu'au statement_timeout (2 min).
 */
const isTransactionPooler = new URL(databaseUrl).port === "6543";

function resolveMaxConnections(): number {
  if (isTransactionPooler) return 20;
  return isVercel ? 1 : 5;
}

const client = postgres(databaseUrl, {
  // Obligatoire derriere un pooler : pas de prepared statements nommes.
  prepare: false,
  // Economise une requete d'introspection des types a chaque nouvelle connexion
  // (~100 ms mesures), ce qui compte en serverless ou les connexions sont recreees.
  fetch_types: false,
  ssl: isSupabase ? "require" : undefined,
  max: resolveMaxConnections(),
  idle_timeout: isVercel ? 10 : 30,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
