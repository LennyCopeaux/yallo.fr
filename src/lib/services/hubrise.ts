export class HubriseError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "HubriseError";
  }
}

interface HubriseCatalogListItem {
  id: string;
  account_id: string;
  location_id: string | null;
  name: string;
  created_at: string;
}

export async function fetchHubriseCatalog(
  accessToken: string,
  locationId: string
): Promise<string> {
  if (!accessToken || !locationId) {
    throw new HubriseError("Access token et location ID sont requis");
  }

  try {
    const catalogsListUrl = `https://api.hubrise.com/v1/location/catalogs`;

    const catalogsResponse = await fetch(catalogsListUrl, {
      method: "GET",
      headers: {
        "X-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!catalogsResponse.ok) {
      const errorText = await catalogsResponse.text().catch(() => "Unknown error");
      
      if (catalogsResponse.status === 401 || catalogsResponse.status === 403) {
        throw new HubriseError(
          "Token d'accès HubRise invalide ou expiré",
          catalogsResponse.status,
          errorText
        );
      }

      throw new HubriseError(
        `Erreur HubRise API lors de la récupération de la liste des catalogues (${catalogsResponse.status}): ${errorText}`,
        catalogsResponse.status,
        errorText
      );
    }

    const catalogsList: HubriseCatalogListItem[] = await catalogsResponse.json();
    
    if (!catalogsList || catalogsList.length === 0) {
      throw new HubriseError(
        "Aucun catalogue trouvé pour cette location HubRise",
        404
      );
    }

    const catalogId = catalogsList[0].id;
    const catalogUrl = `https://api.hubrise.com/v1/catalogs/${catalogId}`;

    const catalogResponse = await fetch(catalogUrl, {
      method: "GET",
      headers: {
        "X-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!catalogResponse.ok) {
      const errorText = await catalogResponse.text().catch(() => "Unknown error");
      
      if (catalogResponse.status === 404) {
        throw new HubriseError(
          `Catalogue HubRise introuvable: ${catalogId}`,
          catalogResponse.status,
          errorText
        );
      }

      throw new HubriseError(
        `Erreur HubRise API lors de la récupération du catalogue (${catalogResponse.status}): ${errorText}`,
        catalogResponse.status,
        errorText
      );
    }

    const catalogData = await catalogResponse.json();
    return JSON.stringify(catalogData, null, 2);
  } catch (error) {
    if (error instanceof HubriseError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new HubriseError(
        `Erreur de connexion à HubRise: ${error.message}`,
        undefined,
        error
      );
    }

    throw new HubriseError("Erreur inconnue lors de la récupération du catalogue HubRise");
  }
}
