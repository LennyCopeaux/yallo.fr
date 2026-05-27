-- Migration: Migration Supabase Auth - ajout auth_user_id, suppression password_hash
-- Description: Lie la table users à Supabase Auth via auth_user_id.
--              Supprime les colonnes liées à l'ancienne auth maison.

-- 1. Ajouter la colonne auth_user_id (nullable d'abord pour les lignes existantes)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "auth_user_id" text;

-- 2. Créer l'index unique (partiel, permet NULL multiples)
CREATE UNIQUE INDEX IF NOT EXISTS "users_auth_user_id_unique" ON "users" ("auth_user_id") WHERE "auth_user_id" IS NOT NULL;

-- 3. Supprimer les colonnes de l'ancienne auth maison
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_hash";
ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_token";
ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_token_expires";
