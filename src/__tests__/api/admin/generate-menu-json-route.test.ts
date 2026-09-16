// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";

const { chain, queue } = vi.hoisted(() => {
  const queue: unknown[][] = [];
  const chain: Record<string, ReturnType<typeof vi.fn>> & {
    then?: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) => Promise<unknown>;
  } = {};
  for (const method of ["select", "from", "where", "limit"]) {
    chain[method] = vi.fn(() => chain);
  }
  chain.then = (resolve, reject) => Promise.resolve(queue.shift() ?? []).then(resolve, reject);
  return { chain, queue };
});

vi.mock("@/db", () => ({ db: chain }));
vi.mock("@/lib/auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));
vi.mock("@/lib/services/hubrise", () => ({
  fetchHubriseCatalog: vi.fn(),
  fetchHubriseCatalogCached: vi.fn(),
}));

import { fetchHubriseCatalog, fetchHubriseCatalogCached } from "@/lib/services/hubrise";
import { GET } from "@/app/api/admin/restaurants/[id]/generate-menu-json/route";

const call = () => GET(new Request("http://localhost/api"), { params: Promise.resolve({ id: "rest-1" }) });

describe("GET /api/admin/restaurants/[id]/generate-menu-json", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queue.length = 0;
  });

  it("lit le catalogue HubRise via la variante mise en cache", async () => {
    queue.push([
      { menuData: null, menuContext: null, hubriseAccessToken: "token", hubriseLocationId: "loc-1" },
    ]);
    vi.mocked(fetchHubriseCatalogCached).mockResolvedValue('{"categories":[]}');

    const response = await call();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ menuJson: '{"categories":[]}' });
    expect(fetchHubriseCatalogCached).toHaveBeenCalledWith("token", "loc-1");
    expect(fetchHubriseCatalog).not.toHaveBeenCalled();
  });

  it("retombe sur menuData quand HubRise échoue", async () => {
    queue.push([
      { menuData: { categories: [] }, menuContext: null, hubriseAccessToken: "token", hubriseLocationId: "loc-1" },
    ]);
    vi.mocked(fetchHubriseCatalogCached).mockRejectedValue(new Error("HubRise down"));

    const response = await call();

    expect(await response.json()).toEqual({ menuJson: JSON.stringify({ categories: [] }, null, 2) });
  });

  it("n'appelle pas HubRise sans configuration", async () => {
    queue.push([{ menuData: null, menuContext: "Menu texte", hubriseAccessToken: null, hubriseLocationId: null }]);

    const response = await call();

    expect(await response.json()).toEqual({ menuJson: "Menu texte" });
    expect(fetchHubriseCatalogCached).not.toHaveBeenCalled();
  });
});
