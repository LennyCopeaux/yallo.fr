import { restaurants, MenuData } from "@/db/schema";
import { fetchHubriseCatalog, HubriseError } from "./hubrise";
import { logger } from "@/lib/logger";

type Restaurant = typeof restaurants.$inferSelect;

async function getMenuStructure(
  restaurant: Restaurant
): Promise<MenuData | unknown> {
  if (restaurant.hubriseAccessToken && restaurant.hubriseLocationId) {
    try {
      const menuJson = await fetchHubriseCatalog(
        restaurant.hubriseAccessToken,
        restaurant.hubriseLocationId
      );
      return JSON.parse(menuJson);
    } catch (error) {
      let errorMessage: string;
      if (error instanceof HubriseError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = "Erreur inconnue";
      }
      logger.warn("HubRise indisponible, fallback sur menu Yallo", {
        restaurantId: restaurant.id,
        error: errorMessage,
      });
    }
  }

  return restaurant.menuData ?? { categories: [], option_lists: [] };
}

export async function generateSystemPrompt(restaurant: Restaurant): Promise<string> {
  const menuStructure = await getMenuStructure(restaurant);

  return `Tu es l'assistant téléphonique de ${restaurant.name}.

Ton rôle est de :
- Prendre les commandes des clients de manière professionnelle et efficace
- Répondre aux questions sur le menu et les prix
- Proposer des suggestions appropriées basées sur les préférences du client
- Confirmer les commandes et les horaires de retrait
- Collecter le nom du client avant de terminer l'appel

Règles importantes :
- Reste professionnel et amical, mais concis (pas de familiarité excessive)
- Si tu ne comprends pas, demande poliment de répéter
- Ne valide JAMAIS un produit sans ses options obligatoires (ex: un kebab sans sauce)
- Demande TOUJOURS le nom du client avant de terminer l'appel
- Ne répète pas la commande complète jusqu'à la fin de l'appel (sauf confirmation finale)

Menu disponible :
${JSON.stringify(menuStructure, null, 2)}

Horaires d'ouverture :
${restaurant.businessHours || "Non configuré"}

En cas d'échec ou de demande du client, transfère l'appel vers le numéro : ${restaurant.phoneNumber}`;
}
