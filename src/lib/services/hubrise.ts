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

/** Noms du type "test …" (catalogues d’essai) — évité en choix auto. */
function looksLikeTestHubriseCatalogName(name: string): boolean {
  return /^test(\s|$)/i.test(name.trim());
}

/** Plusieurs catalogues sur une location : préfère un nom autre que "test …", sinon le plus ancien. */
function pickDefaultHubriseCatalogId(catalogs: HubriseCatalogListItem[]): string {
  if (catalogs.length === 0) {
    throw new HubriseError("Aucun catalogue trouvé pour cette location HubRise", 404);
  }
  if (catalogs.length === 1) {
    return catalogs[0].id;
  }
  const nonTest = catalogs.filter((c) => !looksLikeTestHubriseCatalogName(c.name));
  const pool = nonTest.length > 0 ? nonTest : catalogs;
  const sorted = [...pool].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  return sorted[0].id;
}

export async function fetchHubriseCatalog(
  accessToken: string,
  locationId: string,
  preferredCatalogId?: string | null
): Promise<string> {
  if (!accessToken || !locationId) {
    throw new HubriseError("Access token et location ID sont requis");
  }

  const trimmedPreferred = preferredCatalogId?.trim() || null;

  try {
    let catalogId: string;

    if (trimmedPreferred) {
      catalogId = trimmedPreferred;
    } else {
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

      catalogId = pickDefaultHubriseCatalogId(catalogsList);
    }

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

export interface HubriseVoiceOrderItem {
  product_name: string;
  price: string;
  quantity: string;
}

export interface PushVoiceOrderToHubriseInput {
  ref: string;
  collectionCode: string;
  customerName: string;
  customerPhone?: string;
  items: ReadonlyArray<{
    product_name: string;
    quantity: number;
    unit_price: number;
    options?: string;
  }>;
  expectedTimeIso?: string | null;
  notes?: string | null;
}

/**
 * Envoie une commande vocale Yallo vers HubRise (caisse / file de commandes).
 * Utilise le token et la location configurés pour le restaurant.
 */
export async function pushVoiceOrderToHubrise(
  accessToken: string,
  locationId: string,
  input: PushVoiceOrderToHubriseInput
): Promise<void> {
  if (!accessToken || !locationId) {
    throw new HubriseError("Access token et location ID sont requis pour HubRise");
  }

  const items: HubriseVoiceOrderItem[] = input.items.map((item) => {
    const label =
      item.options !== undefined && item.options.length > 0
        ? `${item.product_name} (${item.options})`
        : item.product_name;
    return {
      product_name: label,
      price: `${item.unit_price.toFixed(2)} EUR`,
      quantity: String(item.quantity),
    };
  });

  const body: Record<string, unknown> = {
    ref: input.ref,
    status: "new",
    service_type: "collection",
    channel: "yallo-voice",
    collection_code: input.collectionCode,
    items,
    customer: {
      ...(input.customerName.length > 0 ? { first_name: input.customerName } : {}),
      ...(input.customerPhone !== undefined && input.customerPhone.length > 0
        ? { phone: input.customerPhone }
        : {}),
    },
  };

  if (input.expectedTimeIso !== undefined && input.expectedTimeIso !== null) {
    body.expected_time = input.expectedTimeIso;
    body.asap = false;
  }

  if (input.notes !== undefined && input.notes !== null && input.notes.length > 0) {
    body.customer_notes = input.notes;
  }

  const url = `https://api.hubrise.com/v1/locations/${encodeURIComponent(locationId)}/orders`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new HubriseError(
        `Erreur HubRise lors de la création de commande (${response.status}): ${errorText}`,
        response.status,
        errorText
      );
    }
  } catch (error) {
    if (error instanceof HubriseError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new HubriseError(`Erreur de connexion à HubRise: ${error.message}`, undefined, error);
    }
    throw new HubriseError("Erreur inconnue lors de l'envoi de commande HubRise");
  }
}
