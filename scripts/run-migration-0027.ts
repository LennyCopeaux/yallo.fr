import postgres from "postgres";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL!);

const migration = readFileSync(join(process.cwd(), "drizzle/0027_add_members_tables.sql"), "utf-8");

async function run() {
  try {
    await sql.unsafe(migration);
    console.log("✅ Migration 0027 applied successfully");
  } catch (e) {
    console.error("❌ Migration error:", e);
  } finally {
    await sql.end();
  }
}

run();
