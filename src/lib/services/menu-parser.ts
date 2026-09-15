import OpenAI from "openai";
import { MenuData } from "@/db/schema";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

const MENU_EXTRACTION_PROMPT = `Rôle : opérateur de saisie. Tu recopies une carte de restaurant en JSON, sans rien interpréter.

Mission : produire un JSON qui reflète la carte À L'IDENTIQUE. Tu n'es pas là pour améliorer, corriger ou compléter la carte : le restaurateur a choisi chaque mot, chaque prix, et le client au téléphone prononce les noms tels qu'ils sont imprimés. Une seule erreur de nom ou de prix fait échouer une commande.

RÈGLES CRITIQUES D'EXTRACTION :

0. NOMS EXACTS, JAMAIS CORRIGÉS :
   - Recopie chaque nom de produit LETTRE POUR LETTRE : apostrophes, majuscules, accents, genre de l'article, fautes et jeux de mots compris.
   - ❌ Interdit: "La Poulet" → "Le Poulet", "Pits'Burger" → "Le P'tit Burger", "Le Végé" → "Le Végétarien", "Sticks mozza" → "Bâtonnets de mozzarella", "Onion rings" → "Oignon rings", "La Fromage" → "La Fromagère"
   - ✅ Correct: le nom imprimé, tel quel, y compris "La Poulet" ou "La Saumon" même si la grammaire te semble fausse.
   - Ne traduis pas, ne reformule pas, n'ajoute pas d'article ("Le", "La") absent de la carte, n'en retire pas non plus.

1. DESCRIPTIONS ET PRIX RECOPIÉS, JAMAIS INVENTÉS :
   - La description est la liste d'ingrédients imprimée, dans l'ordre imprimé, mot pour mot. Tu n'ajoutes aucun ingrédient (pas de "salade, tomate" si la carte ne le dit pas), tu n'en retires aucun, tu ne remplaces pas un ingrédient par un autre (pas de "reblochon" à la place de "raclette").
   - Le prix est celui imprimé sur la ligne, au format décimal avec un point ("9,90€" → "9.90", "2€" → "2", "3,90€ la portion" → prix "3.90", label "la portion").
   - Si une information est illisible ou absente, laisse la chaîne vide. Ne devine jamais.

2. EXHAUSTIVITÉ — CHAQUE LIGNE IMPRIMÉE DEVIENT UN ARTICLE :
   - Parcours chaque section ligne par ligne et compte les produits. Le JSON doit contenir exactement ce nombre d'articles, ni plus ni moins.
   - Une section peut contenir des sous-groupes ("Les pizzas classiques", "Les pizzas fromages", "Les pizzas spéciales", "Les pizzas collections") : chacun de leurs produits est un article de la section, et le nom du sous-groupe va dans "groupe".
   - Oublier un produit est une erreur grave : un client qui le commande s'entendra dire qu'il n'existe pas.

3. ARTICLES SÉPARÉS : Chaque article doit être un objet distinct dans le tableau "articles".
   - ❌ Interdit: "Poivre, Barbecue, Ketchup" dans un seul article
   - ❌ Interdit: "Redbull - Monster Energy", "Tiramisu ou Mousse au chocolat", "Twix / Mars / Snickers" dans un seul article
   - ✅ Correct: un article par produit, même s'ils partagent la même ligne et le même prix (recopie le prix sur chacun). "Tiramisu Caramel spéculos ou Cookie oréo" = deux articles : "Tiramisu Caramel spéculos" et "Tiramisu Cookie oréo".
   - Exception: une ligne "Sodas (33cl)" suivie de parfums (Coca-Cola, Fanta, Sprite…) reste UN article, les parfums vont dans "description" tels qu'imprimés.

4. TAILLES ET GRILLES DE PRIX :
   - Plusieurs prix pour un même produit (colonnes 26 cm / 33 cm / 40 cm, petite / moyenne / grande, simple / double) = plusieurs entrées dans "tarifs", une par colonne, avec le "label" exact de l'en-tête de colonne ("26 cm", "33 cm", "40 cm").
   - Quand une ligne de prix est imprimée au niveau d'un sous-groupe ("Les pizzas classiques  10,50€ 13,50€ 19,50€"), elle s'applique à TOUS les produits de ce sous-groupe jusqu'au sous-groupe suivant. Recopie ces tarifs sur chaque article du sous-groupe.
   - Quand un prix unique est imprimé à côté d'une liste ("3,90€ la portion" au niveau des tapas), il s'applique à chaque produit de la liste.
   - N'invente JAMAIS de taille : un produit avec un seul prix imprimé a un seul tarif, label vide. Une salade, un burger ou une boisson à prix unique n'ont pas de taille.
   - "Simple (1 viande)", "Double (2 viandes)" = VARIANTES (articles séparés avec prix distincts)
   - Couleurs/Teintes (Classique, Rose, Verte) = COSMÉTIQUE (ignorées, pas d'articles séparés). Si couleurs = option client, ajoute dans notes_de_section

5. NOTES, OFFRES ET CONDITIONS :
   - Les mentions au niveau d'une section ("Servis avec frites", "Steak supplémentaire +3€", "Disponible en petite, moyenne, grande") vont dans "notes_de_section" de cette section, mot pour mot.
   - Les mentions générales (halal, livraison, téléphone, adresse) vont dans "regles_globales", mot pour mot.
   - Les zones et minimums de livraison vont dans "offres_et_formules", une condition par ville, EXACTEMENT les villes imprimées : n'ajoute aucune ville, n'en retire aucune.

6. OPTIONS AVEC SUPPLÉMENTS :
   - "+0.90€" ou "+" après un groupe = chaque article du groupe coûte ce supplément
   - Mets le supplément dans le "prix" avec le "+" (ex: "+0.90")
   - Les articles sans "+" marqué gardent tarifs vides

7. IDENTIFIER LE TYPE DE PRODUIT :
   - Lis le titre/entête de chaque section (ex: "NOS SALADES", "NOS PIZZAS", "COMPOSE TON TACOS")
   - Le nom de la catégorie est le titre imprimé, sans le "NOS" ("Salades", "Pizzas")
   - Liste toutes les catégories dans "categories" et dans "regles_globales" ("Types de produits: …")

STRUCTURE JSON ATTENDUE :

{
  "etablissement": "Nom imprimé du restaurant",
  "categories": ["Salades", "Pizzas"],
  "donnees_menu": [
    {
      "categorie": "Salades",
      "notes_de_section": [],
      "articles": [
        { "nom": "La Poulet", "groupe": "", "tarifs": [{ "prix": "9.90", "label": "" }], "description": "Salade, poulet, oignons frits, tomates, champignons, emmental, olives" }
      ]
    },
    {
      "categorie": "Pizzas",
      "notes_de_section": ["Petite 26 cm, Moyenne 33 cm, Grande 40 cm"],
      "articles": [
        { "nom": "La Marguerite", "groupe": "", "tarifs": [{ "prix": "8.50", "label": "26 cm" }, { "prix": "11.50", "label": "33 cm" }, { "prix": "15.50", "label": "40 cm" }], "description": "Base tomate, emmental, olives" },
        { "nom": "La Jambon", "groupe": "Les pizzas classiques", "tarifs": [{ "prix": "10.50", "label": "26 cm" }, { "prix": "13.50", "label": "33 cm" }, { "prix": "19.50", "label": "40 cm" }], "description": "Base tomate, jambon, emmental, olives" }
      ]
    },
    {
      "categorie": "Taille & Quantité",
      "notes_de_section": ["Tacos avec votre choix de viande, base et garnitures"],
      "articles": [
        { "nom": "Tacos Simple (1 viande)", "groupe": "", "tarifs": [{"prix": "6.90", "label": ""}], "description": "" },
        { "nom": "Tacos Double (2 viandes)", "groupe": "", "tarifs": [{"prix": "8.90", "label": ""}], "description": "" }
      ]
    },
    {
      "categorie": "Sauce",
      "notes_de_section": [],
      "articles": [
        { "nom": "Poivre", "groupe": "", "tarifs": [], "description": "" },
        { "nom": "Barbecue", "groupe": "", "tarifs": [], "description": "" }
      ]
    }
  ],
  "option_lists": [],
  "regles_globales": ["Types de produits: Salades, Pizzas"],
  "offres_et_formules": [
    { "nom": "Livraison gratuite sous réserve d'un minimum de commande", "conditions": ["Saint André de Cubzac : 20€"] }
  ]
}

AUTO-CONTRÔLE AVANT DE RÉPONDRE :
- Pour chaque section : le nombre d'articles du JSON est égal au nombre de lignes de produits imprimées.
- Chaque nom, chaque description et chaque prix se retrouvent tels quels sur l'image.
- Aucun produit, ingrédient, prix, taille ou ville n'a été ajouté.

INSTRUCTIONS FINALES :
- Noms recopiés à l'identique, jamais corrigés ni reformulés
- Chaque article DISTINCT dans son propre objet
- Jamais d'articles fusionnés par virgules, tirets, barres obliques ou "ou"
- Ignore les couleurs cosmétiques, traite les tailles comme des tarifs
- Retourne UNIQUEMENT le JSON valide`;

/**
 * Deuxième passe : le modèle relit son propre JSON en face de l'image et
 * corrige les écarts. Sur une carte dense (une soixantaine de lignes), la
 * première passe oublie des produits, décale des prix de sous-groupe et
 * « corrige » des noms ; une relecture ciblée rattrape l'essentiel.
 */
const MENU_REVIEW_PROMPT = `Rôle : relecteur. On te donne une carte de restaurant (images) et un JSON qui prétend la recopier.

Compare le JSON à la carte, section par section, ligne par ligne, et renvoie le JSON corrigé avec EXACTEMENT la même structure. Corrige uniquement ce qui diffère de l'image :
- Produit imprimé absent du JSON → ajoute-le, à sa place, avec son prix et sa description imprimés.
- Produit du JSON absent de l'image → supprime-le.
- Nom modifié (genre, orthographe, apostrophe, reformulation : "Le Poulet" pour "La Poulet", "Le P'tit Burger" pour "Pits'Burger") → remets le nom imprimé, lettre pour lettre.
- Prix différent de l'image, tarif de sous-groupe mal appliqué, taille inventée sur un produit à prix unique, colonne de prix manquante → remets les prix imprimés.
- Ingrédient ajouté, retiré ou remplacé dans une description → remets la liste imprimée, dans l'ordre.
- Plusieurs produits fusionnés dans un même article ("Redbull - Monster Energy") → un article par produit, même prix.
- Ville de livraison, note ou condition absente de l'image → supprime-la ; imprimée mais absente du JSON → ajoute-la.

Ne change rien d'autre. Ne reformule rien. Retourne UNIQUEMENT le JSON valide.`;

function getMenuModel(): string {
  return process.env.OPENAI_MENU_MODEL?.trim() || "gpt-4o";
}

function isReviewPassEnabled(): boolean {
  return process.env.OPENAI_MENU_REVIEW_PASS?.trim().toLowerCase() !== "false";
}

export async function parseMenuFromImages(imageUrls: string[]): Promise<MenuData> {
  if (imageUrls.length === 0) {
    throw new Error("At least one image URL is required");
  }

  if (imageUrls.length > 5) {
    throw new Error("Maximum 5 images allowed per request");
  }

  const openai = getOpenAIClient();
  const model = getMenuModel();

  const imageContent = imageUrls.map((url) => ({
    type: "image_url" as const,
    image_url: { url, detail: "high" as const },
  }));

  const plural = imageUrls.length > 1 ? "s" : "";

  const response = await openai.chat.completions.create({
    model,
    // 0 : on veut une recopie, pas une rédaction. Toute créativité ici est une erreur.
    temperature: 0,
    messages: [
      {
        role: "system",
        content: MENU_EXTRACTION_PROMPT,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Recopie cette carte (${imageUrls.length} image${plural}) en JSON. Chaque ligne de produit imprimée doit apparaître, avec son nom exact, son prix exact et sa description exacte. Ne corrige rien, n'ajoute rien.`,
          },
          ...imageContent,
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 16384,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from OpenAI");
  }

  let parsedMenu = JSON.parse(content) as MenuData;

  if (isReviewPassEnabled()) {
    const review = await openai.chat.completions.create({
      model,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: MENU_REVIEW_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Voici le JSON à vérifier contre la carte ci-jointe :\n${JSON.stringify(parsedMenu)}`,
            },
            ...imageContent,
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 16384,
    });

    const reviewed = review.choices[0]?.message?.content;
    if (reviewed) {
      try {
        parsedMenu = JSON.parse(reviewed) as MenuData;
      } catch {
        // JSON de relecture invalide : on garde la première passe plutôt que d'échouer.
      }
    }
  }

  if (!parsedMenu.categories) {
    parsedMenu.categories = [];
  }

  if (!parsedMenu.option_lists) {
    parsedMenu.option_lists = [];
  }

  return parsedMenu;
}

export async function parseMenuFromBase64Images(base64Images: string[]): Promise<MenuData> {
  const dataUrls = base64Images.map((base64) => {
    if (base64.startsWith("data:")) {
      return base64;
    }
    return `data:image/jpeg;base64,${base64}`;
  });

  return parseMenuFromImages(dataUrls);
}
