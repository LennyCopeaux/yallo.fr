import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  const file = join(process.cwd(), "drizzle", "0034_add_performance_indexes.sql");
  const statements = readFileSync(file, "utf8")
    .split(";")
    .map((chunk) =>
      chunk
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim()
    )
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    const name = /"([a-z_]+_idx)"/.exec(statement)?.[1] ?? statement.slice(0, 40);
    const t0 = performance.now();
    await db.execute(sql.raw(statement));
    console.log(`✓ ${name} (${Math.round(performance.now() - t0)}ms)`);
  }

  console.log(`\n${statements.length} index verifies/crees`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
