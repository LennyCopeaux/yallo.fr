-- Migration: Ajout de la table pricing_config
-- Description: Table pour stocker la configuration globale des prix de l'offre Yallo Infinity

CREATE TABLE IF NOT EXISTS "pricing_config" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "monthly_price" integer DEFAULT 14900 NOT NULL,
  "setup_fee" integer DEFAULT 19900 NOT NULL,
  "included_minutes" integer DEFAULT 600 NOT NULL,
  "overflow_price_per_minute" integer DEFAULT 20 NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

-- Insérer la configuration par défaut
INSERT INTO "pricing_config" ("monthly_price", "setup_fee", "included_minutes", "overflow_price_per_minute")
VALUES (14900, 19900, 600, 20)
ON CONFLICT DO NOTHING;

