import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`
    ALTER TABLE restaurants
      DROP COLUMN IF EXISTS stripe_customer_id,
      DROP COLUMN IF EXISTS stripe_subscription_id,
      DROP COLUMN IF EXISTS stripe_subscription_status,
      DROP COLUMN IF EXISTS stripe_price_id,
      DROP COLUMN IF EXISTS stripe_current_period_end,
      DROP COLUMN IF EXISTS billing_start_date
  `);
  console.log("✓ Stripe columns removed from restaurants table");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
