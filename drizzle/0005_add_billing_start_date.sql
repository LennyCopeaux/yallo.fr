-- Migration: Ajout du champ billing_start_date
-- Description: Ajoute le champ pour stocker la date de début de facturation

ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "billing_start_date" text;

