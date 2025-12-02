/**
 * Script de seed pour insérer le menu complet de "Kebab La Medina"
 * 
 * Usage:
 * 1. Assurez-vous d'avoir créé un restaurant et un utilisateur owner
 * 2. Modifiez RESTAURANT_NAME ci-dessous si nécessaire
 * 3. Exécutez: pnpm seed:menu
 * 
 * NOTE: Ce script NETTOIE toutes les données existantes (sauf users et restaurants) avant d'insérer
 */

// IMPORTANT: Charger dotenv/config en premier pour charger .env.local
import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Charger explicitement .env.local si il existe (dotenv/config charge .env par défaut)
const envLocalPath = resolve(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath, override: true });
}

// Maintenant on peut importer db
import { db } from "./index";
import {
  restaurants,
  ingredientCategories,
  ingredients,
  categories,
  productVariations,
  modifierGroups,
  modifiers,
} from "./schema";
import { eq } from "drizzle-orm";

// Configuration - À MODIFIER selon votre contexte
const RESTAURANT_NAME = "Kebab La Medina"; // Optionnel : si non trouvé, utilise le premier restaurant

async function seedMenu() {
  console.log("🌱 Démarrage du seed du menu...");

  try {
    // 1. Récupérer le restaurant et l'owner
    // Si RESTAURANT_NAME n'est pas trouvé, on récupère le premier restaurant disponible
    let [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.name, RESTAURANT_NAME))
      .limit(1);

    if (!restaurant) {
      console.log(`⚠️ Restaurant "${RESTAURANT_NAME}" non trouvé. Recherche du premier restaurant...`);
      [restaurant] = await db
        .select()
        .from(restaurants)
        .limit(1);
      
      if (!restaurant) {
        throw new Error(
          "Aucun restaurant trouvé dans la base de données. Veuillez d'abord créer un restaurant."
        );
      }
      console.log(`✅ Utilisation du restaurant: ${restaurant.name} (ID: ${restaurant.id})`);
    } else {
      console.log(`✅ Restaurant trouvé: ${restaurant.name} (ID: ${restaurant.id})`);
    }

    const restaurantId = restaurant.id;

    // 2. NETTOYER toutes les données existantes (sauf users et restaurants)
    console.log("🧹 Nettoyage des données existantes...");
    
    try {
      // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
      await db.delete(modifiers);
      await db.delete(modifierGroups);
      await db.delete(productVariations);
      await db.delete(categories);
      await db.delete(ingredients);
      await db.delete(ingredientCategories);
      console.log("✅ Données nettoyées");
    } catch (error) {
      console.error("⚠️ Erreur lors du nettoyage (peut être normal si première exécution):", error);
    }

    // 3. Créer les catégories d'ingrédients
    console.log("📁 Création des catégories d'ingrédients...");
    
    const ingredientCategoriesData = [
      { name: "Viandes", rank: 0 },
      { name: "Sauces", rank: 1 },
      { name: "Suppléments", rank: 2 },
      { name: "Boissons", rank: 3 },
      { name: "Pains", rank: 4 },
    ];

    const insertedIngredientCategories = await db
      .insert(ingredientCategories)
      .values(
        ingredientCategoriesData.map((cat) => ({
          restaurantId,
          ...cat,
        }))
      )
      .returning();

    console.log(`✅ ${insertedIngredientCategories.length} catégories d'ingrédients créées`);

    // Créer un map pour retrouver les catégories par nom
    const ingredientCategoriesMap = new Map(
      insertedIngredientCategories.map((cat) => [cat.name, cat])
    );

    // 4. Créer les ingrédients avec catégories et prix
    console.log("📦 Création des ingrédients...");

    const ingredientsData = [
      // Viandes
      { name: "Viande Kebab", categoryName: "Viandes", price: 0, isAvailable: true },
      { name: "Poulet", categoryName: "Viandes", price: 0, isAvailable: true },
      { name: "Poulet Mariné", categoryName: "Viandes", price: 50, isAvailable: true }, // +0.50€
      { name: "Cordon Bleu", categoryName: "Viandes", price: 0, isAvailable: true },
      { name: "Nuggets", categoryName: "Viandes", price: 0, isAvailable: true },
      { name: "Escalope", categoryName: "Viandes", price: 0, isAvailable: true },
      { name: "Merguez", categoryName: "Viandes", price: 0, isAvailable: true },
      { name: "Steak Haché", categoryName: "Viandes", price: 0, isAvailable: true },
      // Sauces
      { name: "Sauce Blanche", categoryName: "Sauces", price: 0, isAvailable: true },
      { name: "Sauce Algérienne", categoryName: "Sauces", price: 0, isAvailable: true },
      { name: "Sauce Harissa", categoryName: "Sauces", price: 0, isAvailable: true },
      { name: "Sauce Ketchup", categoryName: "Sauces", price: 0, isAvailable: true },
      { name: "Sauce Mayonnaise", categoryName: "Sauces", price: 0, isAvailable: true },
      { name: "Sauce BBQ", categoryName: "Sauces", price: 0, isAvailable: true },
      { name: "Sauce Samouraï", categoryName: "Sauces", price: 0, isAvailable: true },
      // Suppléments
      { name: "Fromage", categoryName: "Suppléments", price: 50, isAvailable: true }, // +0.50€
      { name: "Bacon", categoryName: "Suppléments", price: 100, isAvailable: true }, // +1€
      { name: "Œuf", categoryName: "Suppléments", price: 50, isAvailable: true }, // +0.50€
      { name: "Frites", categoryName: "Suppléments", price: 0, isAvailable: true },
      { name: "Oignons", categoryName: "Suppléments", price: 0, isAvailable: true },
      { name: "Salade", categoryName: "Suppléments", price: 0, isAvailable: true },
      { name: "Tomates", categoryName: "Suppléments", price: 0, isAvailable: true },
      // Boissons
      { name: "Boisson 33cl", categoryName: "Boissons", price: 100, isAvailable: true }, // +1€ pour option menu
      { name: "Boisson 50cl", categoryName: "Boissons", price: 150, isAvailable: true }, // +1.50€
      // Pains
      { name: "Pain", categoryName: "Pains", price: 0, isAvailable: true },
      { name: "Galette", categoryName: "Pains", price: 0, isAvailable: true },
    ];

    const insertedIngredients = await db
      .insert(ingredients)
      .values(
        ingredientsData.map((ing) => {
          const category = ingredientCategoriesMap.get(ing.categoryName);
          if (!category) {
            throw new Error(`Catégorie d'ingrédient "${ing.categoryName}" non trouvée`);
          }
          return {
            restaurantId,
            ingredientCategoryId: category.id,
            name: ing.name,
            price: ing.price,
            isAvailable: ing.isAvailable,
          };
        })
      )
      .returning();

    console.log(`✅ ${insertedIngredients.length} ingrédients créés`);

    // Créer un map pour retrouver les ingrédients rapidement
    const ingredientsMap = new Map(
      insertedIngredients.map((ing) => [ing.name, ing])
    );

    // 5. Créer les catégories de produits
    console.log("📂 Création des catégories de produits...");

    const categoriesData = [
      { name: "Tacos", rank: 0 },
      { name: "Sandwichs", rank: 1 },
      { name: "Assiettes", rank: 2 },
      { name: "Burgers", rank: 3 },
      { name: "Paninis", rank: 4 },
      { name: "Menu Enfant", rank: 5 },
      { name: "Barquettes", rank: 6 },
    ];

    const insertedCategories = await db
      .insert(categories)
      .values(
        categoriesData.map((cat) => ({
          restaurantId,
          ...cat,
        }))
      )
      .returning();

    console.log(`✅ ${insertedCategories.length} catégories de produits créées`);

    // Créer un map pour retrouver les catégories par nom
    const categoriesMap = new Map(
      insertedCategories.map((cat) => [cat.name, cat])
    );

    // 6. Créer directement les variations dans les catégories (plus de niveau produit)
    console.log("📋 Création des variations...");

    // Tacos
    const tacosCategory = categoriesMap.get("Tacos")!;
    const tacosVariations = await db
      .insert(productVariations)
      .values([
        { categoryId: tacosCategory.id, name: "1 Viande", price: 550 },
        { categoryId: tacosCategory.id, name: "2 Viandes", price: 700 },
        { categoryId: tacosCategory.id, name: "3 Viandes", price: 850 },
      ])
      .returning();

    // Sandwichs
    const sandwichCategory = categoriesMap.get("Sandwichs")!;
    const sandwichVariations = await db
      .insert(productVariations)
      .values([
        { categoryId: sandwichCategory.id, name: "Classique", price: 550 },
        { categoryId: sandwichCategory.id, name: "Spécial", price: 700 },
      ])
      .returning();

    // Assiettes
    const assietteCategory = categoriesMap.get("Assiettes")!;
    const assietteVariations = await db
      .insert(productVariations)
      .values([
        { categoryId: assietteCategory.id, name: "Petite", price: 800 },
        { categoryId: assietteCategory.id, name: "Grande", price: 1000 },
      ])
      .returning();

    // Burgers
    const burgerCategory = categoriesMap.get("Burgers")!;
    const burgerVariations = await db
      .insert(productVariations)
      .values([
        { categoryId: burgerCategory.id, name: "Classique", price: 650 },
        { categoryId: burgerCategory.id, name: "Double", price: 850 },
      ])
      .returning();

    // Paninis
    const paniniCategory = categoriesMap.get("Paninis")!;
    const paniniVariations = await db
      .insert(productVariations)
      .values([
        { categoryId: paniniCategory.id, name: "Classique", price: 600 },
        { categoryId: paniniCategory.id, name: "Spécial", price: 750 },
      ])
      .returning();

    // Menu Enfant
    const menuEnfantCategory = categoriesMap.get("Menu Enfant")!;
    const menuEnfantVariations = await db
      .insert(productVariations)
      .values([
        { categoryId: menuEnfantCategory.id, name: "Menu Enfant", price: 600 },
      ])
      .returning();

    // Barquettes
    const barquetteCategory = categoriesMap.get("Barquettes")!;
    const barquetteVariations = await db
      .insert(productVariations)
      .values([
        { categoryId: barquetteCategory.id, name: "Petite", price: 300 },
        { categoryId: barquetteCategory.id, name: "Grande", price: 450 },
      ])
      .returning();

    console.log("✅ Variations créées");

    // 8. Créer les groupes de modificateurs et modificateurs
    console.log("⚙️ Création des groupes de modificateurs...");

    // Récupérer les catégories d'ingrédients nécessaires
    const viandesCategory = ingredientCategoriesMap.get("Viandes")!;
    const saucesCategory = ingredientCategoriesMap.get("Sauces")!;
    const boissonsCategory = ingredientCategoriesMap.get("Boissons")!;
    const painsCategory = ingredientCategoriesMap.get("Pains")!;
    const supplementsCategory = ingredientCategoriesMap.get("Suppléments")!;

    // Pour chaque variation de Tacos
    for (const variation of tacosVariations) {
      const numViandes = parseInt(variation.name.split(" ")[0]);
      
      // Groupe "Choix des viandes" - utilise la catégorie "Viandes"
      const [viandesGroup] = await db
        .insert(modifierGroups)
        .values({
          variationId: variation.id,
          ingredientCategoryId: viandesCategory.id,
          minSelect: numViandes,
          maxSelect: numViandes,
        })
        .returning();

      // Lier toutes les viandes au groupe
      const viandes = [
        "Viande Kebab",
        "Poulet",
        "Poulet Mariné",
        "Cordon Bleu",
        "Nuggets",
        "Escalope",
        "Merguez",
        "Steak Haché",
      ];

      await db.insert(modifiers).values(
        viandes.map((viandeName) => {
          const ingredient = ingredientsMap.get(viandeName)!;
          return {
            groupId: viandesGroup.id,
            ingredientId: ingredient.id,
            priceExtra: ingredient.price, // Utilise le prix par défaut de l'ingrédient
          };
        })
      );

      // Groupe "Sauces" (choix multiple) - utilise la catégorie "Sauces"
      const [saucesGroup] = await db
        .insert(modifierGroups)
        .values({
          variationId: variation.id,
          ingredientCategoryId: saucesCategory.id,
          minSelect: 0,
          maxSelect: 7,
        })
        .returning();

      const sauces = [
        "Sauce Blanche",
        "Sauce Algérienne",
        "Sauce Harissa",
        "Sauce Ketchup",
        "Sauce Mayonnaise",
        "Sauce BBQ",
        "Sauce Samouraï",
      ];

      await db.insert(modifiers).values(
        sauces.map((sauceName) => ({
          groupId: saucesGroup.id,
          ingredientId: ingredientsMap.get(sauceName)!.id,
          priceExtra: 0,
        }))
      );

      // Groupe "Option Menu" (+1€ pour boisson) - utilise la catégorie "Boissons"
      const [menuGroup] = await db
        .insert(modifierGroups)
        .values({
          variationId: variation.id,
          ingredientCategoryId: boissonsCategory.id,
          minSelect: 0,
          maxSelect: 1,
        })
        .returning();

      const boissonIngredient = ingredientsMap.get("Boisson 33cl")!;
      await db.insert(modifiers).values({
        groupId: menuGroup.id,
        ingredientId: boissonIngredient.id,
        priceExtra: boissonIngredient.price, // Utilise le prix par défaut de l'ingrédient
      });
    }

    // Pour les Sandwichs
    for (const variation of sandwichVariations) {
      // Groupe "Choix des viandes" - utilise la catégorie "Viandes"
      const [viandesGroup] = await db
        .insert(modifierGroups)
        .values({
          variationId: variation.id,
          ingredientCategoryId: viandesCategory.id,
          minSelect: 1,
          maxSelect: 1,
        })
        .returning();

      const viandes = [
        "Viande Kebab",
        "Poulet",
        "Poulet Mariné",
        "Cordon Bleu",
        "Nuggets",
        "Escalope",
        "Merguez",
        "Steak Haché",
      ];

      await db.insert(modifiers).values(
        viandes.map((viandeName) => {
          const ingredient = ingredientsMap.get(viandeName)!;
          return {
            groupId: viandesGroup.id,
            ingredientId: ingredient.id,
            priceExtra: ingredient.price, // Utilise le prix par défaut de l'ingrédient
          };
        })
      );

      // Groupe "Choix du pain" - utilise la catégorie "Pains"
      const [painGroup] = await db
        .insert(modifierGroups)
        .values({
          variationId: variation.id,
          ingredientCategoryId: painsCategory.id,
          minSelect: 1,
          maxSelect: 1,
        })
        .returning();

      await db.insert(modifiers).values([
        {
          groupId: painGroup.id,
          ingredientId: ingredientsMap.get("Pain")!.id,
          priceExtra: 0,
        },
        {
          groupId: painGroup.id,
          ingredientId: ingredientsMap.get("Galette")!.id,
          priceExtra: 0,
        },
      ]);

      // Groupe "Sauces" - utilise la catégorie "Sauces"
      const [saucesGroup] = await db
        .insert(modifierGroups)
        .values({
          variationId: variation.id,
          ingredientCategoryId: saucesCategory.id,
          minSelect: 0,
          maxSelect: 7,
        })
        .returning();

      const sauces = [
        "Sauce Blanche",
        "Sauce Algérienne",
        "Sauce Harissa",
        "Sauce Ketchup",
        "Sauce Mayonnaise",
        "Sauce BBQ",
        "Sauce Samouraï",
      ];

      await db.insert(modifiers).values(
        sauces.map((sauceName) => ({
          groupId: saucesGroup.id,
          ingredientId: ingredientsMap.get(sauceName)!.id,
          priceExtra: 0,
        }))
      );

      // Groupe "Suppléments" - utilise la catégorie "Suppléments"
      const [supplementsGroup] = await db
        .insert(modifierGroups)
        .values({
          variationId: variation.id,
          ingredientCategoryId: supplementsCategory.id,
          minSelect: 0,
          maxSelect: 10,
        })
        .returning();

      const supplements = [
        "Fromage",
        "Bacon",
        "Œuf",
        "Frites",
        "Oignons",
        "Salade",
        "Tomates",
      ];

      await db.insert(modifiers).values(
        supplements.map((supplementName) => {
          const ingredient = ingredientsMap.get(supplementName)!;
          return {
            groupId: supplementsGroup.id,
            ingredientId: ingredient.id,
            priceExtra: ingredient.price, // Utilise le prix par défaut de l'ingrédient
          };
        })
      );

      // Groupe "Option Menu" - utilise la catégorie "Boissons"
      const [menuGroup] = await db
        .insert(modifierGroups)
        .values({
          variationId: variation.id,
          ingredientCategoryId: boissonsCategory.id,
          minSelect: 0,
          maxSelect: 1,
        })
        .returning();

      const boissonIngredient = ingredientsMap.get("Boisson 33cl")!;
      await db.insert(modifiers).values({
        groupId: menuGroup.id,
        ingredientId: boissonIngredient.id,
        priceExtra: boissonIngredient.price, // Utilise le prix par défaut de l'ingrédient
      });
    }

    console.log("✅ Groupes de modificateurs et modificateurs créés");

    console.log("🎉 Seed terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors du seed:", error);
    throw error;
  }
}

// Exécuter le seed
seedMenu()
  .then(() => {
    console.log("✅ Script terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });
