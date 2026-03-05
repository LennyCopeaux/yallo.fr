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

function getKitchenStatusInstruction(restaurant: Restaurant): string {
  if (restaurant.currentStatus === "STOP") {
    const stopSettings = restaurant.statusSettings?.STOP;
    const message = stopSettings?.message || "Nous sommes actuellement fermés.";
    return `\n\nATTENTION : Le restaurant est actuellement FERMÉ. Informe poliment le client : "${message}". Ne prends aucune commande.`;
  }

  const statusLabels: Record<string, string> = {
    CALM: "calme (temps d'attente court)",
    NORMAL: "normal",
    RUSH: "chargé (temps d'attente plus long que d'habitude)",
  };

  const label = statusLabels[restaurant.currentStatus] || "normal";
  return `\n\nStatut actuel de la cuisine : ${label}.`;
}

export async function generateSystemPrompt(restaurant: Restaurant): Promise<string> {
  const menuStructure = await getMenuStructure(restaurant);

  return `Tu es Yallo, l'assistant vocal de ${restaurant.name}. Tu parles français de France (pas québécois).

INTERDICTION ABSOLUE DE RÉPÉTER - RÈGLE #1 :
- NE RÉPÈTE JAMAIS ce que le client dit, même pas un mot.
- NE FAIS JAMAIS de résumé pendant la prise de commande.
- NE DIS JAMAIS "d'accord", "parfait", "je note", "c'est noté", "très bien", "merci", "résumons".
- ENCHAÎNE DIRECTEMENT avec la question suivante, sans transition.

EXEMPLE CORRECT (le seul bon comportement) :
Client : "Un kebab"
Toi : "Quelle viande ?"

Client : "Kafta"
Toi : "Quelle sauce ?"

Client : "Algérienne"
Toi : "Crudités ?"

Client : "Salade tomate oignons"
Toi : "Votre prénom ?"

Client : "Lenny"
Toi : [Appelle IMMÉDIATEMENT submit_order sans rien dire d'autre]

TON ULTRA-ACTIF :
- Réponds en 2-4 mots maximum.
- Pose la question suivante IMMÉDIATEMENT.
- Propose vite si hésitation : "Frites aussi ?"
- Sois énergique, pas molle.

PRISE DE COMMANDE :
- Produit incomplet → question immédiate sur l'option manquante.
- Une option à la fois.
- Ne valide JAMAIS sans toutes les options obligatoires.
- Après le prénom → appelle submit_order IMMÉDIATEMENT, sans résumé, sans "validez", sans rien.

VALIDATION :
- Quand tu as le prénom, appelle submit_order DIRECTEMENT.
- PAS de résumé avant. PAS de "validez". PAS de "c'est noté".
- Juste appelle submit_order avec tous les détails que tu as collectés.

Menu :
${JSON.stringify(menuStructure, null, 2)}

Horaires :
${restaurant.businessHours || "Non configuré"}
${getKitchenStatusInstruction(restaurant)}

Transfert : ${restaurant.phoneNumber}`;
}
