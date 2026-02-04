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

Mission : Convertir les images de ce menu en JSON. Tu dois extraire 100% des informations, y compris les icônes, les badges de prix, et les notes isolées.

CONSIGNES DE DÉTECTION CRITIQUES :

Icônes et Badges de prix : Surveille attentivement les bords des titres (ex: icônes de boisson avec "+1€"). Ce sont des formules "Menu". Note-les systématiquement dans la section notes_de_section de la catégorie concernée.

Règles métier cachées : Si un supplément (ex: "+0.50€", "+1€") est écrit dans une bulle ou à côté d'un groupe de produits, il doit impérativement apparaître dans le JSON, soit lié au produit, soit dans les règles globales.

Lecture à 360° : Ne néglige aucun texte, même écrit en très petit en bas de page ou sur les côtés (ex: "Frites à part", "À emporter").

STRUCTURE JSON ATTENDUE :

{
  "etablissement": "Nom si visible",
  "donnees_menu": [
    {
      "categorie": "Nom de la section",
      "notes_de_section": ["Ex: +1€ pour la boisson (vu sur l'icône)", "Ex: Pain au choix"],
      "articles": [
        {
          "nom": "Nom exact",
          "description": "Ingrédients ou détails",
          "tarifs": [
            { "label": "Format (Standard, XL, Verre, etc.)", "prix": "0.00" }
          ]
        }
      ]
    }
  ],
  "regles_globales": ["Toutes les notes générales ou hors-catégorie"],
  "offres_et_formules": ["Détails des menus complets ou promotions groupées"]
}
  
FORMAT DES PRIX : Uniquement des nombres en format string (ex: "7.50"), sans symbole monétaire.

Retourne UNIQUEMENT le JSON.`;

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
