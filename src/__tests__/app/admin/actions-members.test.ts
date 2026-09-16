// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";

// Chaîne Drizzle factice : chaque méthode se renvoie elle-même et `await`
// consomme le prochain résultat de la file, dans l'ordre des requêtes émises.
const { chain, queue } = vi.hoisted(() => {
  const queue: unknown[][] = [];
  const chain: Record<string, ReturnType<typeof vi.fn>> & {
    then?: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) => Promise<unknown>;
  } = {};
  for (const method of [
    "select",
    "from",
    "innerJoin",
    "where",
    "limit",
    "orderBy",
    "insert",
    "values",
    "onConflictDoNothing",
    "delete",
    "update",
    "set",
    "returning",
  ]) {
    chain[method] = vi.fn(() => chain);
  }
  chain.then = (resolve, reject) => Promise.resolve(queue.shift() ?? []).then(resolve, reject);
  return { chain, queue };
});

vi.mock("@/db", () => ({ db: chain }));
vi.mock("@/lib/auth", () => ({ requireAdmin: vi.fn(), getAppUser: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/mail", () => ({ sendWelcomeEmail: vi.fn() }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  setRestaurantMembers,
  setOrganizationMembers,
  deleteRestaurant,
} from "@/app/(admin)/admin/actions";

const RESTAURANT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ORG_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";

const revalidatedPaths = () => vi.mocked(revalidatePath).mock.calls.map((call) => call[0]);

describe("setRestaurantMembers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queue.length = 0;
    vi.mocked(requireAdmin).mockResolvedValue({ id: "admin", role: "ADMIN" } as never);
  });

  it("refuse un lot qui laisserait le restaurant sans membre, avant toute écriture", async () => {
    queue.push([{ total: "1", alreadyMembers: "0", removing: "1" }]);

    const result = await setRestaurantMembers(RESTAURANT_ID, { remove: [USER_A] });

    expect(result).toEqual({ success: false, error: "Impossible de retirer le dernier membre" });
    expect(chain.delete).not.toHaveBeenCalled();
    expect(chain.insert).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("applique ajouts et retraits en un seul appel et revalide liste + fiche", async () => {
    queue.push([{ total: "1", alreadyMembers: "0", removing: "1" }]);
    queue.push([{ id: USER_A, role: "OWNER" }]);

    const result = await setRestaurantMembers(RESTAURANT_ID, { add: [USER_A], remove: [USER_B] });

    expect(result).toEqual({ success: true });
    expect(chain.values).toHaveBeenCalledWith([
      { restaurantId: RESTAURANT_ID, userId: USER_A, role: "owner" },
    ]);
    expect(chain.delete).toHaveBeenCalledTimes(1);
    expect(revalidatedPaths()).toEqual(
      expect.arrayContaining(["/admin", "/admin/restaurants", `/admin/restaurants/${RESTAURANT_ID}`])
    );
  });

  it("ne fait rien sans changement", async () => {
    const result = await setRestaurantMembers(RESTAURANT_ID, { add: [], remove: [] });

    expect(result).toEqual({ success: true });
    expect(chain.select).not.toHaveBeenCalled();
  });

  it("rejette les identifiants invalides", async () => {
    const result = await setRestaurantMembers(RESTAURANT_ID, { add: ["not-a-uuid"] });

    expect(result).toEqual({ success: false, error: "Données invalides" });
    expect(chain.select).not.toHaveBeenCalled();
  });

  it("échoue proprement quand l'appelant n'est pas admin", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("Unauthorized"));

    const result = await setRestaurantMembers(RESTAURANT_ID, { add: [USER_A] });

    expect(result.success).toBe(false);
    expect(chain.select).not.toHaveBeenCalled();
  });
});

describe("setOrganizationMembers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queue.length = 0;
    vi.mocked(requireAdmin).mockResolvedValue({ id: "admin", role: "ADMIN" } as never);
  });

  it("propage les nouveaux membres aux restaurants de l'organisation et revalide leurs fiches", async () => {
    queue.push([{ total: "1", alreadyMembers: "0", removing: "0" }]);
    queue.push([{ id: USER_A, role: "EMPLOYEE" }]);
    queue.push([]);
    queue.push([{ id: "rest-1" }, { id: "rest-2" }]);

    const result = await setOrganizationMembers(ORG_ID, { add: [USER_A] });

    expect(result).toEqual({ success: true });
    expect(chain.values).toHaveBeenNthCalledWith(1, [
      { organizationId: ORG_ID, userId: USER_A, role: "member" },
    ]);
    expect(chain.values).toHaveBeenNthCalledWith(2, [
      { restaurantId: "rest-1", userId: USER_A, role: "member" },
      { restaurantId: "rest-2", userId: USER_A, role: "member" },
    ]);
    expect(revalidatedPaths()).toEqual(
      expect.arrayContaining([
        "/admin/organizations",
        `/admin/organizations/${ORG_ID}`,
        "/admin/restaurants",
        "/admin/restaurants/rest-1",
        "/admin/restaurants/rest-2",
      ])
    );
  });

  it("refuse de retirer le dernier membre", async () => {
    queue.push([{ total: "2", alreadyMembers: "0", removing: "2" }]);

    const result = await setOrganizationMembers(ORG_ID, { remove: [USER_A, USER_B] });

    expect(result).toEqual({ success: false, error: "Impossible de retirer le dernier membre" });
    expect(chain.delete).not.toHaveBeenCalled();
  });
});

describe("deleteRestaurant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queue.length = 0;
    vi.mocked(requireAdmin).mockResolvedValue({ id: "admin", role: "ADMIN" } as never);
  });

  it("revalide la liste des restaurants et l'organisation quittée", async () => {
    queue.push([{ organizationId: ORG_ID }]);

    const result = await deleteRestaurant(RESTAURANT_ID);

    expect(result).toEqual({ success: true });
    expect(revalidatedPaths()).toEqual(
      expect.arrayContaining(["/admin", "/admin/restaurants", "/admin/organizations", `/admin/organizations/${ORG_ID}`])
    );
  });
});
