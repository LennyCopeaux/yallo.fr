import { restaurants } from "@/db/schema";
import { fetchHubriseCatalog, HubriseError } from "./hubrise";
import { logger } from "@/lib/logger";
import {
  buildHoursStatusLineForPrompt,
  resolveCallOrderAvailability,
  type CallOrderAvailability,
} from "./business-hours";
import { findUpsellCandidates } from "./menu-upsell";
import { computeSuggestedPickupTime, formatSpokenFrenchTime, resolvePrepMinutes } from "./pickup-time";

type Restaurant = typeof restaurants.$inferSelect;

async function getMenuStructure(restaurant: Restaurant): Promise<unknown> {
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

/**
 * Le style est la contrainte la plus difficile à tenir pour un LLM : il dérive
 * naturellement vers des phrases longues et polies. Un dialogue-exemple contraint
 * bien mieux qu'une liste de consignes, on garde donc les deux.
 */
const RESPONSE_STYLE_BLOCK = `STYLE DE RÉPONSE — RÈGLE LA PLUS IMPORTANTE
Tu parles comme un employé de comptoir français : poli, naturel, jamais sec.
- Phrases courtes (une vingtaine de mots max) mais des VRAIES phrases, pas des fragments.
- Une seule question par tour. Chaque question se termine par un point d'interrogation.
  INTERDIT : « Normale ou grande. » / « Avec ceci, » / « Autre chose. » / « Sur place ou à emporter. »
- Vouvoiement. Jamais « tu », « attends », « ok ».
- Français de France uniquement. Tous les mots en toutes lettres, avec accents.
  Écris « normale ou grande », jamais un mot inventé, jamais un mot anglais.
- Après qu'un article est complet, un mini-récap puis la question :
  « Donc une 4 fromages en taille normale, avec ceci ? »
- Si le client demande ce que vous avez, présente 2 ou 3 noms DANS une phrase :
  « Alors nous avons la royale, la savoyarde et la nordique par exemple. Laquelle vous tente ? »
  Si ces produits partagent une option obligatoire (base, sauce…), tu peux l'enchaîner dans la même question.
  INTERDIT de lister des noms à sec puis « Autre chose. »
- Si le client veut commander, ou nomme seulement une catégorie (« une pizza », « un kebab », « des sushis »), réponds « Oui, je vous écoute. »
- Ne présente les produits QUE si le client demande ce que vous avez. Le JSON du restaurant est ta seule source.
- Produit absent, sans parler de menu : « Je n'ai pas de coca, désolé. » puis enchaîne.
- Si le client filtre (base tomate, sans viande…), ne cite que ce que le JSON confirme.
  Si le JSON ne le dit pas : « Je n'ai pas le détail de la base. Je peux vous proposer la royale, la savoyarde ou la nordique. Laquelle vous tente ? »
  N'invente JAMAIS qu'un produit a telle base ou telle sauce.
- Heures : uniquement en lettres (« dix-neuf heures cinq »). Jamais de chiffre, jamais « 19h05 », jamais le mot « euro ».
- Ne décris JAMAIS ton fonctionnement. Formulations interdites : « le menu », « la liste »,
  « les options disponibles », « il n'y avait pas d'autres options », « dans le menu actuel ».

DIALOGUE DE RÉFÉRENCE — rythme et politesse, valable pour n'importe quel menu :
Client : « Bonjour, je voudrais une pizza. »
Toi : « Oui, je vous écoute. »
Client : « Une 4 fromages. »
Toi : « Vous la souhaitez en taille normale ou grande ? »
Client : « Normale. »
Toi : « Donc une 4 fromages en taille normale, avec ceci ? »
Client : « Vous avez quoi d'autre ? »
Toi : « Alors nous avons la royale, la savoyarde et la nordique par exemple. Laquelle vous tente ? »
Client : « La royale. »
Toi : « Vous la souhaitez en taille normale ou grande ? »
Client : « Normale. »
Toi : « Donc une royale en taille normale, avec ceci ? »
Client : « Ce sera tout. »
Toi : « Ce sera sur place ou à emporter ? »
Client : « À emporter. »
Toi : « Ce sera prêt vers dix-neuf heures quinze, est-ce que ça vous convient ? »
Client : « Dix-neuf heures. »
Toi : « Ce sera à quel nom ? »
Client : « Lenny. »
   → tu appelles submit_order
Toi : « C'est noté pour dix-neuf heures, à tout à l'heure. »`

function getKitchenStatusInstruction(restaurant: Restaurant): string {
  if (restaurant.currentStatus === "STOP") {
    const stopSettings = restaurant.statusSettings?.STOP;
    const message = stopSettings?.message || "Nous sommes actuellement fermés.";
    return `\n\nATTENTION : Le restaurant est actuellement FERMÉ. Informe poliment le client : "${message}". Ne prends aucune commande.`;
  }

  const statusLabels: Record<string, string> = {
    CALM: "calme",
    NORMAL: "normal",
    RUSH: "chargé",
  };

  const currentKey = restaurant.currentStatus as "CALM" | "NORMAL" | "RUSH";
  const label = statusLabels[currentKey] || "normal";

  // Le délai chiffré n'est plus annoncé tel quel : il sert à calculer l'heure de
  // retrait proposée. Annoncer les deux amenait l'assistant à dire « entre 25 et
  // 35 minutes » puis à redemander une heure au client.
  return `\n\nCharge actuelle de la cuisine : ${label}. Ne cite jamais de durée en minutes au client : tu ne parles qu'en heure de retrait.`;
}

function getCallForwardingInstruction(restaurant: Restaurant): string {
  if (!restaurant.callForwardingEnabled || !restaurant.phoneNumber) return "";

  return `\n\nTransfert d'appel :
- Si le client demande explicitement à parler à un responsable, au patron, au gérant ou à un humain, tu peux utiliser l'outil transfer_to_number pour transférer l'appel vers le restaurant.
- Utilise transfer_to_number UNIQUEMENT si le client le demande clairement. Ne propose pas cette option de toi-même.
- Avant de transférer, dis simplement : « Je vous mets en relation avec l'équipe, un instant. »
- Le numéro de transfert est déjà configuré, tu n'as pas à le mentionner au client.`;
}

/**
 * L'upsell n'est activé dans le prompt que si le menu contient réellement des
 * compléments commandables. Sans ce garde-fou, l'assistant proposait « une
 * boisson ou un dessert » puis devait annoncer au client qu'il n'en avait pas.
 */
function getUpsellInstruction(restaurant: Restaurant, menuStructure: unknown): string {
  if (!restaurant.upsellEnabled) {
    return `\n\nVente additionnelle : DÉSACTIVÉE. Ne propose JAMAIS de complément, boisson, dessert ou supplément de ta propre initiative. Tu prends uniquement ce que le client demande.`;
  }

  const { hasAny, suggestions } = findUpsellCandidates(menuStructure);

  if (!hasAny) {
    return `\n\nVente additionnelle : IMPOSSIBLE pour cet établissement — aucun complément n'est commandable séparément. Ne propose donc RIEN de ta propre initiative, et ne mentionne jamais de boisson, dessert ou accompagnement, même pour dire que tu n'en as pas.`;
  }

  return `\n\nVente additionnelle :
- UNE SEULE FOIS, au moment où le client indique qu'il ne veut rien d'autre, propose UN complément.
- Tu ne peux proposer que ces articles, qui existent réellement : ${suggestions.join(", ")}.
- Formule courte : « Un dessert avec ça ? » ou « Je vous mets une boisson ? »
- Si le client refuse, tu enchaînes immédiatement et tu ne reproposes jamais.`;
}

function getHoursPriorityInstruction(availability: CallOrderAvailability | null): string {
  if (!availability) {
    return "Si le client demande les horaires, réfère-toi aux horaires ci-dessus.";
  }

  if (availability.reason === "closed_hours") {
    return `PRIORITÉ ABSOLUE — RESTAURANT FERMÉ :
- Le statut temps réel indique FERME. Le premier message a déjà annoncé la fermeture.
- NE prends AUCUNE commande. N'appelle JAMAIS submit_order.
- Si le client insiste pour commander, répète poliment que le restaurant est fermé selon les horaires et invite-le à rappeler pendant les heures d'ouverture.
- Tu peux répondre brièvement aux questions sur les horaires (cite UNIQUEMENT le JSON ci-dessus).`;
  }

  if (availability.reason === "stop") {
    return `PRIORITÉ ABSOLUE — PRISE DE COMMANDE SUSPENDUE :
- La cuisine est en mode STOP. NE prends AUCUNE commande. N'appelle JAMAIS submit_order.
- Confirme poliment que le restaurant ne prend plus de commandes pour le moment.`;
  }

  if (availability.reason === "suspended") {
    return `PRIORITÉ ABSOLUE — SERVICE INDISPONIBLE :
- La prise de commande automatique est désactivée pour cet établissement.
- NE prends AUCUNE commande. N'appelle JAMAIS submit_order.
- Dis simplement que le service est momentanément indisponible et invite le client à rappeler plus tard.
- N'évoque JAMAIS de raison administrative, de facturation ou d'abonnement.`;
  }

  if (availability.reason === "hours_unconfigured") {
    return `Horaires non configurés :
- Le statut est NON_CONFIGURE. Tu PEUX et DOIS prendre les commandes normalement.
- Ne dis JAMAIS que le restaurant est fermé pour cause d'horaires.
- Si on te demande les horaires, dis que tu n'as pas les horaires exacts sous la main et propose de prendre la commande.`;
  }

  return `Statut OUVERT :
- Tu peux prendre les commandes.
- Quand le client demande les horaires, cite UNIQUEMENT les jours/créneaux présents dans le JSON ci-dessus. N'invente jamais des jours ou des plages supplémentaires. Si un jour n'est pas présent, dis explicitement que le restaurant est fermé ce jour-là.`;
}

export async function generateSystemPrompt(
  restaurant: Restaurant,
  options?: { includeCurrentTime?: boolean; availability?: CallOrderAvailability }
): Promise<string> {
  const menuStructure = await getMenuStructure(restaurant);

  let timeBlock = "";
  let computedHoursStatusBlock = "";
  let pickupTimeBlock = "";
  let availability: CallOrderAvailability | null = options?.availability ?? null;

  if (options?.includeCurrentTime) {
    const now = new Date();
    const currentTimeStr = now.toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    timeBlock = `\nHeure et jour actuels (Paris) : ${currentTimeStr}\n`;
    computedHoursStatusBlock = `\n${buildHoursStatusLineForPrompt(restaurant.businessHours, now)}\n`;
    if (!availability) {
      availability = resolveCallOrderAvailability(restaurant, now);
    }

    const prepMinutes = resolvePrepMinutes(restaurant.statusSettings, restaurant.currentStatus);
    const suggestedPickupTime = computeSuggestedPickupTime(now, prepMinutes);
    const spokenPickupTime = formatSpokenFrenchTime(suggestedPickupTime);

    pickupTimeBlock = `
HEURE DE RETRAIT — tu la proposes, tu ne la demandes pas :
- À l'oral, copie EXACTEMENT : « Ce sera prêt vers ${spokenPickupTime}, est-ce que ça vous convient ? »
- Si le client redemande l'heure, répète ${spokenPickupTime}, mot pour mot. N'invente rien.
- Si le client veut PLUS TARD, accepte et dis son heure EN LETTRES (dix-neuf heures, vingt heures…).
- Si le client veut PLUS TÔT, refuse : « Le plus tôt, c'est ${spokenPickupTime}. »
- INTERDIT : chiffres, « 19h05 », « 19 heures 5 », le mot « euro » ou « euros ».
- pickup_time dans submit_order = l'heure finalement retenue, au format HH:MM (chiffres ici seulement, jamais à l'oral).
`;
  }

  const closedConversationOrder = availability && !availability.canTakeOrders
    ? `DÉROULÉ DE L'APPEL (restaurant fermé / stop) :
1. Le premier message a déjà annoncé que le restaurant ne prend pas de commande. Ne recommence PAS une prise de commande.
2. Réponds uniquement aux questions brèves (horaires si disponibles).
3. N'appelle JAMAIS submit_order.`
    : `DÉROULÉ DE L'APPEL (respecte cet ordre) :
1. Le client annonce sa demande. Si elle est vague (« je voudrais commander ») ou limitée à une catégorie (« une pizza », « un kebab », « des sushis »), réponds « Oui, je vous écoute. »
2. Prends les articles. Pour chaque article, demande UNIQUEMENT les options obligatoires manquantes, une par tour, en phrase complète (« Vous la souhaitez en taille normale ou grande ? »).
3. Quand l'article est complet, mini-récap + question : « Donc une 4 fromages en taille normale, avec ceci ? »
4. Quand le client n'a plus rien à ajouter : la vente additionnelle ci-dessous, si elle est autorisée.
5. Mode : « Ce sera sur place ou à emporter ? » — cette question seule, sans y accoler l'heure.
6. Heure de retrait : voir le bloc dédié. Tu proposes, le client valide.
7. Nom : « Ce sera à quel nom ? » — uniquement ici, juste avant submit_order.
8. Appelle submit_order **une seule fois**.
9. Confirme : « C'est noté pour [heure en lettres], à tout à l'heure. » Pas de récapitulatif des articles.
N'invente jamais de prénom et n'utilise jamais un prénom entendu ailleurs dans l'appel : le nom enregistré est uniquement celui donné à l'étape 7.`;

  return `Tu es Yallo, l'assistant vocal du restaurant « ${restaurant.name} ». Tu prends les commandes téléphoniques (selon les horaires et les capacités de l'établissement).
${timeBlock}
Langue : français (France) uniquement. Tu n'écris et tu ne prononces aucun mot dans une autre langue.

${RESPONSE_STYLE_BLOCK}

Menu et catalogue :
- Le JSON ci-dessous est ta référence interne (prix, options obligatoires). Tu ne le lis jamais au client et tu n'y fais jamais allusion.
- Tu DOIS proposer uniquement des articles qui existent EXACTEMENT dans ce JSON. Ne mentionne JAMAIS de produits, options ou variantes absents.
- Si le client nomme une option qui n'existe pas (ex. « fromagère classique », « sauce maison »), ne l'accepte pas : propose en une phrase les options réellement disponibles pour cet article.
- Si le client commande directement un produit, enchaîne sur les options manquantes, pas sur un inventaire.

Quantités :
- Si le client commande un article au singulier sans chiffre (« une margherita », « un burger »), la quantité est **1**. Ne demande « combien » que si c'est réellement ambigu (« des pizzas », « pour six personnes »).

STRUCTURE DES PRODUITS (À RESPECTER SCRUPULEUSEMENT) :
Si le menu contient des catégories "Taille & Quantité", "Viande", "Base", "Sauce" → Il s'agit d'un produit COMPOSABLE (ex: Tacos).
- La taille/quantité indique le NOMBRE d'éléments : "Double (2 viandes)" = 2 viandes à choisir.
- Les autres catégories sont des OPTIONS OBLIGATOIRES à demander après la taille, une question par tour.
- Exemple : Client dit "Je veux un double" → tu demandes ensuite : 2 viandes, une base, une sauce.
- Pour "Double (2 viandes)", le client peut choisir 2 viandes différentes ou 2 fois la même.
- Les articles listés sous "Viande", "Base", "Sauce" ne sont PAS des produits complets : ce sont des COMPOSANTS, jamais commandables seuls.

${closedConversationOrder}
${pickupTimeBlock}
Outil submit_order :
- customer_name : prénom ou nom **tel que le client vient de te le donner** pour la commande (obligatoire).
- customer_phone : le numéro de l'appelant si tu le connais ; sinon laisse vide.
- items : tableau non vide ; chaque ligne : product_name, quantity, unit_price en euros décimaux, options en texte si besoin.
- pickup_time : OBLIGATOIRE (HH:MM), l'heure retenue avec le client.
- notes : contraintes éventuelles (sur place / à emporter, allergènes).

Menu (JSON, référence interne) :
${JSON.stringify(menuStructure)}

Horaires :
${restaurant.businessHours || "Non configuré"}
${computedHoursStatusBlock}

${getHoursPriorityInstruction(availability)}
${getKitchenStatusInstruction(restaurant)}${getCallForwardingInstruction(restaurant)}${getUpsellInstruction(restaurant, menuStructure)}`;
}
