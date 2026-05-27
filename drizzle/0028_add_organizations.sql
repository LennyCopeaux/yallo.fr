-- ============================================================
-- Migration 0028 — Couche Organisation
--
-- Crée la table organizations (porteuse du contrat Stripe),
-- ajoute organization_id sur restaurants,
-- et migre les données existantes (1 restaurant → 1 org).
-- ============================================================

-- 1. Créer la table organizations
CREATE TABLE IF NOT EXISTS "organizations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "stripe_subscription_status" text,
  "stripe_price_id" text,
  "stripe_current_period_end" timestamp,
  "billing_start_date" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- 2. Ajouter la colonne organization_id sur restaurants (nullable pour la transition)
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "organization_id" uuid REFERENCES "organizations"("id") ON DELETE SET NULL;

-- 3. Migration des données : créer une organisation par restaurant existant
-- (en production : 1 user = 1 restaurant, donc 1 org par restaurant)
INSERT INTO "organizations" (
  "id",
  "name",
  "owner_id",
  "stripe_customer_id",
  "stripe_subscription_id",
  "stripe_subscription_status",
  "stripe_price_id",
  "stripe_current_period_end",
  "billing_start_date",
  "is_active",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  r."name",
  r."owner_id",
  r."stripe_customer_id",
  r."stripe_subscription_id",
  r."stripe_subscription_status",
  r."stripe_price_id",
  r."stripe_current_period_end",
  r."billing_start_date",
  r."is_active",
  now(),
  now()
FROM "restaurants" r
-- Ne pas créer de doublon si la migration est rejouée
WHERE NOT EXISTS (
  SELECT 1 FROM "organizations" o WHERE o."owner_id" = r."owner_id"
);

-- 4. Rattacher chaque restaurant à son organisation
UPDATE "restaurants" r
SET "organization_id" = o."id"
FROM "organizations" o
WHERE o."owner_id" = r."owner_id"
  AND r."organization_id" IS NULL;
