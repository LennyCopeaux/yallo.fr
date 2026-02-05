-- Migration: Ajout de la table pricing_plans
-- Description: Table pour stocker les 3 offres tarifaires (Starter, Essential, Infinity)

CREATE TABLE IF NOT EXISTS "pricing_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL UNIQUE,
  "subtitle" text NOT NULL,
  "target" text NOT NULL,
  "monthly_price" integer NOT NULL,
  "setup_fee" integer,
  "commission_rate" integer,
  "included_minutes" integer,
  "overflow_price_per_minute" integer,
  "hubrise" boolean DEFAULT false NOT NULL,
  "popular" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Insérer les 3 offres par défaut
INSERT INTO "pricing_plans" (
  "name",
  "subtitle",
  "target",
  "monthly_price",
  "setup_fee",
  "commission_rate",
  "included_minutes",
  "overflow_price_per_minute",
  "hubrise",
  "popular"
) VALUES
  (
    'starter',
    'Test',
    'Pour tester l''IA sans risque',
    2900, -- 29€
    9900, -- 99€
    7, -- 7%
    NULL, -- Minutes illimitées
    NULL, -- Pas de coût min sup
    false,
    false
  ),
  (
    'essential',
    'Standard',
    'Pour les restaurants en croissance',
    14900, -- 149€
    NULL, -- Pas de frais de mise en service
    0, -- 0% commission
    400, -- 400 minutes
    25, -- 0,25€ par minute supplémentaire
    true,
    true
  ),
  (
    'infinity',
    'Volume',
    'Pour les gros volumes d''appels',
    34900, -- 349€
    NULL, -- Pas de frais de mise en service
    0, -- 0% commission
    1200, -- 1200 minutes
    20, -- 0,20€ par minute supplémentaire
    true,
    false
  )
ON CONFLICT ("name") DO NOTHING;
