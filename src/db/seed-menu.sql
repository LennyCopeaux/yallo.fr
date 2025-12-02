-- Script SQL pour insérer le menu complet de "Kebab La Medina"
-- Compatible PostgreSQL
-- À exécuter après avoir créé le restaurant et l'utilisateur owner

-- IMPORTANT: Remplacez les UUIDs ci-dessous par les vrais UUIDs de votre restaurant et owner
-- Vous pouvez les obtenir avec: SELECT id FROM restaurants WHERE name = 'Kebab La Medina';
-- et: SELECT id FROM users WHERE email = 'votre-email@exemple.com';

-- Variables à remplacer (à adapter selon votre contexte)
-- :RESTAURANT_ID et :OWNER_ID doivent être remplacés par les vrais UUIDs

-- ============================================
-- 1. INGRÉDIENTS
-- ============================================

-- Viandes
INSERT INTO ingredients (restaurant_id, name, is_available, image_url) VALUES
(:RESTAURANT_ID, 'Viande Kebab', true, NULL),
(:RESTAURANT_ID, 'Poulet', true, NULL),
(:RESTAURANT_ID, 'Poulet Mariné', true, NULL),
(:RESTAURANT_ID, 'Cordon Bleu', true, NULL),
(:RESTAURANT_ID, 'Nuggets', true, NULL),
(:RESTAURANT_ID, 'Escalope', true, NULL),
(:RESTAURANT_ID, 'Merguez', true, NULL),
(:RESTAURANT_ID, 'Steak Haché', true, NULL);

-- Sauces
INSERT INTO ingredients (restaurant_id, name, is_available, image_url) VALUES
(:RESTAURANT_ID, 'Sauce Blanche', true, NULL),
(:RESTAURANT_ID, 'Sauce Algérienne', true, NULL),
(:RESTAURANT_ID, 'Sauce Harissa', true, NULL),
(:RESTAURANT_ID, 'Sauce Ketchup', true, NULL),
(:RESTAURANT_ID, 'Sauce Mayonnaise', true, NULL),
(:RESTAURANT_ID, 'Sauce BBQ', true, NULL),
(:RESTAURANT_ID, 'Sauce Samouraï', true, NULL);

-- Suppléments
INSERT INTO ingredients (restaurant_id, name, is_available, image_url) VALUES
(:RESTAURANT_ID, 'Fromage', true, NULL),
(:RESTAURANT_ID, 'Bacon', true, NULL),
(:RESTAURANT_ID, 'Œuf', true, NULL),
(:RESTAURANT_ID, 'Frites', true, NULL),
(:RESTAURANT_ID, 'Oignons', true, NULL),
(:RESTAURANT_ID, 'Salade', true, NULL),
(:RESTAURANT_ID, 'Tomates', true, NULL);

-- Boissons
INSERT INTO ingredients (restaurant_id, name, is_available, image_url) VALUES
(:RESTAURANT_ID, 'Boisson 33cl', true, NULL),
(:RESTAURANT_ID, 'Boisson 50cl', true, NULL);

-- Pains
INSERT INTO ingredients (restaurant_id, name, is_available, image_url) VALUES
(:RESTAURANT_ID, 'Pain', true, NULL),
(:RESTAURANT_ID, 'Galette', true, NULL);

-- ============================================
-- 2. CATÉGORIES
-- ============================================

INSERT INTO categories (restaurant_id, name, rank) VALUES
(:RESTAURANT_ID, 'Sandwichs', 1),
(:RESTAURANT_ID, 'Tacos', 2),
(:RESTAURANT_ID, 'Assiettes', 3),
(:RESTAURANT_ID, 'Burgers', 4),
(:RESTAURANT_ID, 'Paninis', 5),
(:RESTAURANT_ID, 'Menu Enfants', 6),
(:RESTAURANT_ID, 'Barquettes/Sides', 7);

-- ============================================
-- 3. PRODUITS ET VARIATIONS
-- ============================================

-- TACOS
-- Produit: Tacos
INSERT INTO products (category_id, name, description, image_url)
SELECT id, 'Tacos', 'Tacos avec viande au choix', NULL
FROM categories WHERE name = 'Tacos' AND restaurant_id = :RESTAURANT_ID;

-- Variations Tacos
INSERT INTO product_variations (product_id, name, price)
SELECT p.id, '1 Viande', 800
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Tacos' AND c.restaurant_id = :RESTAURANT_ID;

INSERT INTO product_variations (product_id, name, price)
SELECT p.id, '2 Viandes', 900
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Tacos' AND c.restaurant_id = :RESTAURANT_ID;

INSERT INTO product_variations (product_id, name, price)
SELECT p.id, '3 Viandes', 1000
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Tacos' AND c.restaurant_id = :RESTAURANT_ID;

INSERT INTO product_variations (product_id, name, price)
SELECT p.id, '4 Viandes', 1100
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Tacos' AND c.restaurant_id = :RESTAURANT_ID;

-- SANDWICHS
-- Produit: Sandwich
INSERT INTO products (category_id, name, description, image_url)
SELECT id, 'Sandwich', 'Sandwich avec viande au choix', NULL
FROM categories WHERE name = 'Sandwichs' AND restaurant_id = :RESTAURANT_ID;

-- Variations Sandwich
INSERT INTO product_variations (product_id, name, price)
SELECT p.id, 'Classique', 600
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Sandwich' AND c.restaurant_id = :RESTAURANT_ID;

INSERT INTO product_variations (product_id, name, price)
SELECT p.id, 'Spécial', 750
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Sandwich' AND c.restaurant_id = :RESTAURANT_ID;

-- ASSIETTES
-- Produit: Assiette
INSERT INTO products (category_id, name, description, image_url)
SELECT id, 'Assiette', 'Assiette avec viande au choix et frites', NULL
FROM categories WHERE name = 'Assiettes' AND restaurant_id = :RESTAURANT_ID;

-- Variations Assiette
INSERT INTO product_variations (product_id, name, price)
SELECT p.id, 'Classique', 1000
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Assiette' AND c.restaurant_id = :RESTAURANT_ID;

INSERT INTO product_variations (product_id, name, price)
SELECT p.id, 'Grande', 1200
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Assiette' AND c.restaurant_id = :RESTAURANT_ID;

-- BURGERS
-- Produit: Burger
INSERT INTO products (category_id, name, description, image_url)
SELECT id, 'Burger', 'Burger avec viande au choix', NULL
FROM categories WHERE name = 'Burgers' AND restaurant_id = :RESTAURANT_ID;

-- Variations Burger
INSERT INTO product_variations (product_id, name, price)
SELECT p.id, 'Classique', 800
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Burger' AND c.restaurant_id = :RESTAURANT_ID;

INSERT INTO product_variations (product_id, name, price)
SELECT p.id, 'Spécial', 950
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Burger' AND c.restaurant_id = :RESTAURANT_ID;

-- PANINIS
-- Produit: Panini
INSERT INTO products (category_id, name, description, image_url)
SELECT id, 'Panini', 'Panini grillé avec viande au choix', NULL
FROM categories WHERE name = 'Paninis' AND restaurant_id = :RESTAURANT_ID;

-- Variations Panini
INSERT INTO product_variations (product_id, name, price)
SELECT p.id, 'Classique', 700
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Panini' AND c.restaurant_id = :RESTAURANT_ID;

-- MENU ENFANTS
-- Produit: Menu Enfant
INSERT INTO products (category_id, name, description, image_url)
SELECT id, 'Menu Enfant', 'Menu spécial pour enfants', NULL
FROM categories WHERE name = 'Menu Enfants' AND restaurant_id = :RESTAURANT_ID;

-- Variations Menu Enfant
INSERT INTO product_variations (product_id, name, price)
SELECT p.id, 'Nuggets', 600
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Menu Enfant' AND c.restaurant_id = :RESTAURANT_ID;

INSERT INTO product_variations (product_id, name, price)
SELECT p.id, 'Cordon Bleu', 650
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Menu Enfant' AND c.restaurant_id = :RESTAURANT_ID;

-- BARQUETTES/SIDES
-- Produit: Barquette de Frites
INSERT INTO products (category_id, name, description, image_url)
SELECT id, 'Barquette de Frites', 'Barquette de frites', NULL
FROM categories WHERE name = 'Barquettes/Sides' AND restaurant_id = :RESTAURANT_ID;

-- Variations Barquette
INSERT INTO product_variations (product_id, name, price)
SELECT p.id, 'Petite', 300
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Barquette de Frites' AND c.restaurant_id = :RESTAURANT_ID;

INSERT INTO product_variations (product_id, name, price)
SELECT p.id, 'Grande', 450
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Barquette de Frites' AND c.restaurant_id = :RESTAURANT_ID;

-- ============================================
-- 4. GROUPES DE MODIFICATEURS ET MODIFICATEURS
-- ============================================

-- Pour chaque variation de Tacos, créer le groupe "Choix des viandes"
-- Tacos 1 Viande
INSERT INTO modifier_groups (variation_id, name, min_select, max_select)
SELECT pv.id, 'Choix des viandes', 1, 1
FROM product_variations pv
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Tacos' AND pv.name = '1 Viande' AND c.restaurant_id = :RESTAURANT_ID;

-- Tacos 2 Viandes
INSERT INTO modifier_groups (variation_id, name, min_select, max_select)
SELECT pv.id, 'Choix des viandes', 2, 2
FROM product_variations pv
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Tacos' AND pv.name = '2 Viandes' AND c.restaurant_id = :RESTAURANT_ID;

-- Tacos 3 Viandes
INSERT INTO modifier_groups (variation_id, name, min_select, max_select)
SELECT pv.id, 'Choix des viandes', 3, 3
FROM product_variations pv
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Tacos' AND pv.name = '3 Viandes' AND c.restaurant_id = :RESTAURANT_ID;

-- Tacos 4 Viandes
INSERT INTO modifier_groups (variation_id, name, min_select, max_select)
SELECT pv.id, 'Choix des viandes', 4, 4
FROM product_variations pv
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Tacos' AND pv.name = '4 Viandes' AND c.restaurant_id = :RESTAURANT_ID;

-- Lier les viandes aux groupes "Choix des viandes" pour les Tacos
-- Viande Kebab (pas de supplément)
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, 0
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Tacos' AND mg.name = 'Choix des viandes' AND i.name = 'Viande Kebab';

-- Poulet (pas de supplément)
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, 0
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Tacos' AND mg.name = 'Choix des viandes' AND i.name = 'Poulet';

-- Poulet Mariné (+0.50€ = 50 centimes)
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, 50
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Tacos' AND mg.name = 'Choix des viandes' AND i.name = 'Poulet Mariné';

-- Cordon Bleu (pas de supplément)
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, 0
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Tacos' AND mg.name = 'Choix des viandes' AND i.name = 'Cordon Bleu';

-- Nuggets (pas de supplément)
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, 0
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Tacos' AND mg.name = 'Choix des viandes' AND i.name = 'Nuggets';

-- Escalope (pas de supplément)
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, 0
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Tacos' AND mg.name = 'Choix des viandes' AND i.name = 'Escalope';

-- Merguez (pas de supplément)
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, 0
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Tacos' AND mg.name = 'Choix des viandes' AND i.name = 'Merguez';

-- Steak Haché (pas de supplément)
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, 0
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Tacos' AND mg.name = 'Choix des viandes' AND i.name = 'Steak Haché';

-- Groupe "Sauces" pour tous les Tacos (choix multiple)
INSERT INTO modifier_groups (variation_id, name, min_select, max_select)
SELECT pv.id, 'Sauces', 0, 7
FROM product_variations pv
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Tacos' AND c.restaurant_id = :RESTAURANT_ID;

-- Lier toutes les sauces au groupe "Sauces" des Tacos
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, 0
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Tacos' AND mg.name = 'Sauces' AND i.name LIKE 'Sauce%';

-- Groupe "Option Menu" pour les Tacos (+1€ pour boisson)
INSERT INTO modifier_groups (variation_id, name, min_select, max_select)
SELECT pv.id, 'Option Menu', 0, 1
FROM product_variations pv
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Tacos' AND c.restaurant_id = :RESTAURANT_ID;

-- Lier la boisson au groupe "Option Menu" des Tacos (+100 centimes = 1€)
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, 100
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Tacos' AND mg.name = 'Option Menu' AND i.name = 'Boisson 33cl';

-- Pour les Sandwichs, créer les groupes similaires
-- Groupe "Choix des viandes" pour Sandwichs
INSERT INTO modifier_groups (variation_id, name, min_select, max_select)
SELECT pv.id, 'Choix des viandes', 1, 1
FROM product_variations pv
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Sandwich' AND c.restaurant_id = :RESTAURANT_ID;

-- Lier les viandes aux groupes "Choix des viandes" pour les Sandwichs (même logique que Tacos)
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, CASE WHEN i.name = 'Poulet Mariné' THEN 50 ELSE 0 END
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Sandwich' AND mg.name = 'Choix des viandes' 
AND i.name IN ('Viande Kebab', 'Poulet', 'Poulet Mariné', 'Cordon Bleu', 'Nuggets', 'Escalope', 'Merguez', 'Steak Haché');

-- Groupe "Choix du pain" pour Sandwichs
INSERT INTO modifier_groups (variation_id, name, min_select, max_select)
SELECT pv.id, 'Choix du pain', 1, 1
FROM product_variations pv
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Sandwich' AND c.restaurant_id = :RESTAURANT_ID;

-- Lier Pain et Galette au groupe "Choix du pain"
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, 0
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Sandwich' AND mg.name = 'Choix du pain' AND i.name IN ('Pain', 'Galette');

-- Groupe "Sauces" pour Sandwichs
INSERT INTO modifier_groups (variation_id, name, min_select, max_select)
SELECT pv.id, 'Sauces', 0, 7
FROM product_variations pv
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Sandwich' AND c.restaurant_id = :RESTAURANT_ID;

-- Lier toutes les sauces au groupe "Sauces" des Sandwichs
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, 0
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Sandwich' AND mg.name = 'Sauces' AND i.name LIKE 'Sauce%';

-- Groupe "Suppléments" pour Sandwichs (choix multiple)
INSERT INTO modifier_groups (variation_id, name, min_select, max_select)
SELECT pv.id, 'Suppléments', 0, 10
FROM product_variations pv
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Sandwich' AND c.restaurant_id = :RESTAURANT_ID;

-- Lier les suppléments au groupe "Suppléments" des Sandwichs
-- Exemple de prix: Fromage +0.50€, Bacon +1€, Œuf +0.50€
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, 
  CASE 
    WHEN i.name = 'Fromage' THEN 50
    WHEN i.name = 'Bacon' THEN 100
    WHEN i.name = 'Œuf' THEN 50
    ELSE 0
  END
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Sandwich' AND mg.name = 'Suppléments' 
AND i.name IN ('Fromage', 'Bacon', 'Œuf', 'Frites', 'Oignons', 'Salade', 'Tomates');

-- Groupe "Option Menu" pour Sandwichs (+1€ pour boisson)
INSERT INTO modifier_groups (variation_id, name, min_select, max_select)
SELECT pv.id, 'Option Menu', 0, 1
FROM product_variations pv
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Sandwich' AND c.restaurant_id = :RESTAURANT_ID;

-- Lier la boisson au groupe "Option Menu" des Sandwichs
INSERT INTO modifiers (group_id, ingredient_id, price_extra)
SELECT mg.id, i.id, 100
FROM modifier_groups mg
INNER JOIN product_variations pv ON mg.variation_id = pv.id
INNER JOIN products p ON pv.product_id = p.id
INNER JOIN ingredients i ON i.restaurant_id = :RESTAURANT_ID
WHERE p.name = 'Sandwich' AND mg.name = 'Option Menu' AND i.name = 'Boisson 33cl';

-- Note: Répéter la même logique pour les autres produits (Assiettes, Burgers, Paninis, etc.)
-- selon les besoins spécifiques de chaque produit

