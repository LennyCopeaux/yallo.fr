-- ============================================================
-- Migration 0029 — Table call_logs
--
-- Stocke chaque appel IA (VAPI / ElevenLabs) avec sa durée.
-- Alimentée par les webhooks end-of-call.
-- ============================================================

CREATE TABLE IF NOT EXISTS "call_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "restaurant_id" uuid NOT NULL REFERENCES "restaurants"("id") ON DELETE CASCADE,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "external_call_id" text NOT NULL,
  "provider" text NOT NULL,
  "duration_seconds" integer NOT NULL,
  "started_at" timestamp,
  "ended_at" timestamp,
  "status" text DEFAULT 'completed' NOT NULL,
  "created_at" timestamp DEFAULT now()
);

-- Index pour les agrégations mensuelles par organisation
CREATE INDEX IF NOT EXISTS "call_logs_organization_id_created_at_idx"
  ON "call_logs" ("organization_id", "created_at");

-- Index pour les agrégations par restaurant
CREATE INDEX IF NOT EXISTS "call_logs_restaurant_id_created_at_idx"
  ON "call_logs" ("restaurant_id", "created_at");

-- Évite les doublons si le webhook est rejoué
CREATE UNIQUE INDEX IF NOT EXISTS "call_logs_external_call_id_provider_idx"
  ON "call_logs" ("external_call_id", "provider");
