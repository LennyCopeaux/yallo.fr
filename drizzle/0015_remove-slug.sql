-- Supprimer la colonne slug de la table restaurants
ALTER TABLE "restaurants" DROP COLUMN IF EXISTS "slug";

-- Supprimer l'index unique sur slug s'il existe
DROP INDEX IF EXISTS "restaurants_slug_unique";
