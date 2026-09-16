// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";

// Chaîne Drizzle factice : chaque méthode se renvoie elle-même et `await` consomme
// le prochain résultat de la file. Permet d'inspecter le SQL réellement construit
// sans base de données.
const { chain, queue } = vi.hoisted(() => {
  const queue: unknown[][] = [];
  const chain: Record<string, ReturnType<typeof vi.fn>> & {
    then?: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) => Promise<unknown>;
  } = {};
  for (const method of ["select", "from", "innerJoin", "leftJoin", "where", "groupBy", "orderBy", "limit"]) {
    chain[method] = vi.fn(() => chain);
  }
  chain.then = (resolve, reject) => Promise.resolve(queue.shift() ?? []).then(resolve, reject);
  return { chain, queue };
});

vi.mock("@/db", () => ({ db: chain }));

import { getRestaurantsWithFilters, getRestaurantCallStats } from "@/app/(admin)/admin/queries";

const dialect = new PgDialect();
const render = (fragment: SQL) => dialect.sqlToQuery(fragment).sql;

describe("getRestaurantsWithFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queue.length = 0;
  });

  it("compte les commandes via une sous-requête corrélée, sans jointure ni GROUP BY sur orders", async () => {
    queue.push([]);

    await getRestaurantsWithFilters();

    const fields = chain.select.mock.calls[0][0] as { ordersCount: { sql: SQL } };
    const ordersCountSql = render(fields.ordersCount.sql);
    expect(ordersCountSql).toMatch(/select count\(\*\) from "orders" where "orders"\."restaurant_id" = "restaurants"\."id"/i);
    expect(chain.leftJoin).not.toHaveBeenCalled();
    expect(chain.groupBy).not.toHaveBeenCalled();
  });

  it("garde la forme de résultat attendue par les tableaux (ordersCount numérique, owners)", async () => {
    queue.push([
      { id: "r1", name: "Kebab", ownerEmail: "owner@test.fr", ordersCount: "12" },
    ]);
    queue.push([{ restaurantId: "r1", email: "member@test.fr" }]);

    const [row] = await getRestaurantsWithFilters();

    expect(row.ordersCount).toBe(12);
    expect(row.owners).toEqual(["member@test.fr"]);
  });
});

describe("getRestaurantCallStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queue.length = 0;
  });

  it("filtre les 30 derniers jours sur COALESCE(started_at, created_at)", async () => {
    queue.push([{ callCount: "3", totalSeconds: "180", avgSeconds: "60" }]);
    queue.push([{ callCount: "2", totalSeconds: "90" }]);

    const stats = await getRestaurantCallStats("rest-1");

    const whereClauses = chain.where.mock.calls.map((call) => render(call[0] as SQL));
    expect(whereClauses.some((clause) => /coalesce\("call_logs"\."started_at", "call_logs"\."created_at"\) >=/i.test(clause))).toBe(true);
    expect(stats).toEqual({
      allTime: { callCount: 3, totalMinutes: 3, avgSeconds: 60 },
      last30Days: { callCount: 2, totalMinutes: 2 },
    });
  });
});

describe("Admin Queries - Search Sanitization", () => {
  function sanitizeSearchPattern(search: string): string {
    const sanitized = search.replace(/[%_]/g, "");
    return `%${sanitized}%`;
  }

  it("should sanitize SQL wildcards from search input", () => {
    expect(sanitizeSearchPattern("test%injection")).toBe("%testinjection%");
    expect(sanitizeSearchPattern("test_injection")).toBe("%testinjection%");
    expect(sanitizeSearchPattern("%_%")).toBe("%%");
  });

  it("should handle normal search strings", () => {
    expect(sanitizeSearchPattern("restaurant")).toBe("%restaurant%");
    expect(sanitizeSearchPattern("kebab house")).toBe("%kebab house%");
  });

  it("should handle empty search string", () => {
    expect(sanitizeSearchPattern("")).toBe("%%");
  });

  it("should handle special characters that are not SQL wildcards", () => {
    expect(sanitizeSearchPattern("l'étoile")).toBe("%l'étoile%");
    expect(sanitizeSearchPattern("café & co")).toBe("%café & co%");
  });
});

describe("Admin Queries - Status Validation", () => {
  const validStatuses = ["active", "suspended", "onboarding"];

  function isValidStatus(status: string): boolean {
    return validStatuses.includes(status);
  }

  it("should accept valid statuses", () => {
    expect(isValidStatus("active")).toBe(true);
    expect(isValidStatus("suspended")).toBe(true);
    expect(isValidStatus("onboarding")).toBe(true);
  });

  it("should reject invalid statuses", () => {
    expect(isValidStatus("invalid")).toBe(false);
    expect(isValidStatus("ACTIVE")).toBe(false);
    expect(isValidStatus("")).toBe(false);
  });
});
