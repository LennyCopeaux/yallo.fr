import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HubriseError, fetchHubriseCatalog } from "@/lib/services/hubrise";

describe("HubriseError", () => {
  it("devrait créer une erreur avec message seulement", () => {
    const error = new HubriseError("Test error");
    
    expect(error.message).toBe("Test error");
    expect(error.name).toBe("HubriseError");
    expect(error.statusCode).toBeUndefined();
    expect(error.response).toBeUndefined();
  });

  it("devrait créer une erreur avec statusCode", () => {
    const error = new HubriseError("Token invalide", 401);
    
    expect(error.message).toBe("Token invalide");
    expect(error.statusCode).toBe(401);
  });

  it("devrait créer une erreur avec response", () => {
    const responseData = { error: "unauthorized" };
    const error = new HubriseError("Token invalide", 401, responseData);
    
    expect(error.response).toEqual(responseData);
  });

  it("devrait être une instance de Error", () => {
    const error = new HubriseError("Test");
    
    expect(error instanceof Error).toBe(true);
    expect(error instanceof HubriseError).toBe(true);
  });
});

describe("fetchHubriseCatalog", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("devrait lancer une erreur si accessToken est vide", async () => {
    await expect(fetchHubriseCatalog("", "location-123")).rejects.toThrow(
      "Access token et location ID sont requis"
    );
  });

  it("devrait lancer une erreur si locationId est vide", async () => {
    await expect(fetchHubriseCatalog("token-123", "")).rejects.toThrow(
      "Access token et location ID sont requis"
    );
  });

  it("devrait lancer une erreur si les deux sont vides", async () => {
    await expect(fetchHubriseCatalog("", "")).rejects.toThrow(
      "Access token et location ID sont requis"
    );
  });

  const listItem = (
    id: string,
    name: string,
    created_at: string
  ): { id: string; account_id: string; location_id: string | null; name: string; created_at: string } => ({
    id,
    account_id: "acc",
    location_id: "loc",
    name,
    created_at,
  });

  it("devrait récupérer le catalogue avec succès", async () => {
    const catalogsList = [listItem("catalog-123", "Menu principal", "2020-01-01T00:00:00Z")];
    const catalogData = {
      categories: [{ name: "Kebabs" }],
      products: [{ name: "Kebab Viande" }],
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(catalogsList),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(catalogData),
      });

    const result = await fetchHubriseCatalog("valid-token", "location-123");
    
    expect(result).toBe(JSON.stringify(catalogData, null, 2));
    expect(mockFetch).toHaveBeenCalledTimes(2);
    
    // Vérifier le premier appel (liste des catalogues)
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "https://api.hubrise.com/v1/location/catalogs",
      expect.objectContaining({
        method: "GET",
        headers: {
          "X-Access-Token": "valid-token",
          "Content-Type": "application/json",
        },
      })
    );
    
    // Vérifier le deuxième appel (catalogue spécifique)
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "https://api.hubrise.com/v1/catalogs/catalog-123",
      expect.objectContaining({
        method: "GET",
        headers: {
          "X-Access-Token": "valid-token",
          "Content-Type": "application/json",
        },
      })
    );
  });

  it("devrait lancer une erreur 401 pour token invalide", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });

    await expect(fetchHubriseCatalog("invalid-token", "location-123")).rejects.toThrow(
      "Token d'accès HubRise invalide ou expiré"
    );
  });

  it("devrait lancer une erreur 403 pour accès refusé", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: () => Promise.resolve("Forbidden"),
    });

    await expect(fetchHubriseCatalog("token", "location-123")).rejects.toThrow(
      "Token d'accès HubRise invalide ou expiré"
    );
  });

  it("devrait lancer une erreur si aucun catalogue trouvé", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await expect(fetchHubriseCatalog("token", "location-123")).rejects.toThrow(
      "Aucun catalogue trouvé pour cette location HubRise"
    );
  });

  it("devrait gérer les erreurs réseau", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(fetchHubriseCatalog("token", "location-123")).rejects.toThrow(
      "Erreur de connexion à HubRise: Network error"
    );
  });

  it("devrait utiliser l’ID catalogue imposé sans appeler la liste", async () => {
    const catalogData = { id: "1rbmp", data: { categories: [], products: [] } };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(catalogData),
    });

    const result = await fetchHubriseCatalog("valid-token", "location-123", "1rbmp");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.hubrise.com/v1/catalogs/1rbmp",
      expect.objectContaining({ method: "GET" })
    );
    expect(result).toBe(JSON.stringify(catalogData, null, 2));
  });

  it("devrait préférer un catalogue non « test » quand plusieurs sont listés", async () => {
    const catalogsList = [
      listItem("kkqv", "test 1kkqv", "2026-04-02T00:00:00Z"),
      listItem("1rbmp", "Menu Kebab La Medina", "2026-01-15T00:00:00Z"),
    ];
    const catalogData = { id: "1rbmp", data: { categories: [{ name: "Tacos" }], products: [] } };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(catalogsList),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(catalogData),
      });

    const result = await fetchHubriseCatalog("valid-token", "location-123");

    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "https://api.hubrise.com/v1/catalogs/1rbmp",
      expect.anything()
    );
    expect(result).toContain("Tacos");
  });

  it("devrait lancer une erreur 404 si catalogue introuvable", async () => {
    const catalogsList = [listItem("catalog-123", "Menu principal", "2020-01-01T00:00:00Z")];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(catalogsList),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not found"),
      });

    await expect(fetchHubriseCatalog("token", "location-123")).rejects.toThrow(
      "Catalogue HubRise introuvable: catalog-123"
    );
  });
});
