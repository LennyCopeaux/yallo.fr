import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`
    ALTER TABLE organizations
      ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  `);
  console.log("✓ status column added to organizations table");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
