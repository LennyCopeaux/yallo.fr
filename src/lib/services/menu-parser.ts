import OpenAI from "openai";
import { MenuData } from "@/db/schema";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

const MENU_EXTRACTION_PROMPT = `Rôle : Expert OCR et Architecte de Données.

Mission : Convertir les images de ce menu en JSON. Tu dois extraire 100% des informations de manière STRUCTURÉE ET SÉPARÉE.

RÈGLES CRITIQUES D'EXTRACTION :

1. IDENTIFIER LE TYPE DE PRODUIT :
   - Lis le titre/entête du menu (ex: "COMPOSE TON TACOS", "PIZZAS", "BURGERS")
   - Extrais le NOM du produit (ex: "Tacos", "Pizza", "Burger")
   - Mentionne-le dans la catégorie principale ou dans les règles globales si pertinent
   - L'IA DOIT savoir de quel type de produit on parle!

2. ARTICLES SÉPARÉS : Chaque article doit être un objet distinct dans le tableau "articles".
   - ❌ Interdit: "Poivre, Barbecue, Ketchup" dans un seul article
   - ✅ Correct: "Poivre", "Barbecue", "Ketchup" dans 3 articles différents

3. VARIANTES DE TAILLE/QUANTITÉ SEULEMENT :
   - "Simple (1 viande)", "Double (2 viandes)" = VARIANTES (articles séparés avec prix distincts)
   - Couleurs/Teintes (Classique, Rose, Verte) = COSMÉTIQUE (ignorées, pas d'articles séparés)
   - Si couleurs = option client, ajoute dans notes_de_section

4. OPTIONS AVEC SUPPLÉMENTS :
   - "+0.90€" ou "+" après un groupe = chaque article du groupe coûte ce supplément
   - Mets le supplément dans le "prix" avec le "+" (ex: "+0.90")
   - Les articles sans "+" marqué gardent tarifs vides

STRUCTURE JSON ATTENDUE :

{
  "donnees_menu": [
    {
      "categorie": "Taille & Quantité",
      "notes_de_section": ["Tacos avec votre choix de viande, base et garnitures"],
      "articles": [
        { "nom": "Tacos Simple (1 viande)", "tarifs": [{"prix": "6.90", "label": ""}], "description": "" },
        { "nom": "Tacos Double (2 viandes)", "tarifs": [{"prix": "8.90", "label": ""}], "description": "" },
        { "nom": "Tacos Triple (3 viandes)", "tarifs": [{"prix": "10.90", "label": ""}], "description": "" }
      ]
    },
    {
      "categorie": "Sauce",
      "notes_de_section": [],
      "articles": [
        { "nom": "Poivre", "tarifs": [], "description": "" },
        { "nom": "Barbecue", "tarifs": [], "description": "" },
        { "nom": "Ketchup", "tarifs": [], "description": "" }
      ]
    }
  ],
  "option_lists": [],
  "etablissement": "Nom du restaurant",
  "regles_globales": ["Type de produit: Tacos"],
  "offres_et_formules": [],
  "categories": []
}

INSTRUCTIONS FINALES :
- Mentionne explicitement le TYPE DE PRODUIT (Tacos, Pizza, etc.)
- Chaque article DISTINCT dans son propre objet
- Jamais d'articles fusionnés par virgules
- Ignore les couleurs cosmétiques, traite les tailles comme articles séparés
- Retourne UNIQUEMENT le JSON valide`;

export async function parseMenuFromImages(imageUrls: string[]): Promise<MenuData> {
  if (imageUrls.length === 0) {
    throw new Error("At least one image URL is required");
  }

  if (imageUrls.length > 5) {
    throw new Error("Maximum 5 images allowed per request");
  }

  const openai = getOpenAIClient();

  const imageContent = imageUrls.map((url) => ({
    type: "image_url" as const,
    image_url: { url, detail: "high" as const },
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
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
            text: `Analyse ces ${imageUrls.length} image${imageUrls.length > 1 ? "s" : ""} de menu et extrais TOUTES les informations visibles : produits, prix, suppléments, formules, options, notes. Sois exhaustif et précis.`,
          },
          ...imageContent,
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 8192,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsedMenu = JSON.parse(content) as MenuData;

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
