-- Migration: Ajout du statut de charge de la cuisine
-- Description: Ajoute les colonnes current_status et status_settings à la table restaurants

-- Création de l'enum pour le statut de la cuisine
DO $$ BEGIN
    CREATE TYPE "kitchen_status" AS ENUM('CALM', 'NORMAL', 'RUSH', 'STOP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ajout de la colonne current_status avec valeur par défaut CALM
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "current_status" "kitchen_status" DEFAULT 'CALM' NOT NULL;

-- Ajout de la colonne status_settings (JSONB)
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "status_settings" jsonb;

