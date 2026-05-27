import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS elevenlabs_agent_id text`);
  await db.execute(sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS elevenlabs_phone_number_id text`);
  console.log("✓ Columns added successfully");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
