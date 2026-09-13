/**
 * Applique un fichier SQL de `drizzle/` sur la base configuree.
 * Les migrations de ce projet sont ecrites a la main et appliquees directement
 * (le journal drizzle-kit n'est plus a jour depuis la 0027).
 *
 * Usage : pnpm tsx --env-file=.env.local scripts/apply-sql-migration.ts 0035_add_manual_access.sql
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    throw new Error("Indiquez au moins un fichier SQL de drizzle/");
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL manquante");
  }

  const sql = postgres(databaseUrl, {
    prepare: false,
    fetch_types: false,
    ssl: databaseUrl.includes("supabase.co") ? "require" : undefined,
    max: 1,
  });

  try {
    for (const file of files) {
      const path = join(process.cwd(), "drizzle", file);
      const statements = readFileSync(path, "utf8");
      console.log(`\n--- ${file} ---`);
      await sql.unsafe(statements);
      console.log("applique");
    }
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
