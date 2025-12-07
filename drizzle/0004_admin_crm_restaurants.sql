-- Migration: Admin CRM - Ajout des champs restaurants
-- Description: Ajoute les champs nécessaires pour le Back-Office CRM complet

-- Création des enums pour le statut et le plan
DO $$ BEGIN
    CREATE TYPE "restaurant_status" AS ENUM('active', 'suspended', 'onboarding');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "restaurant_plan" AS ENUM('fixed', 'commission');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ajout des nouvelles colonnes à la table restaurants
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "address" text;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "status" "restaurant_status" DEFAULT 'onboarding' NOT NULL;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "plan" "restaurant_plan" DEFAULT 'commission';
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "commission_rate" integer DEFAULT 5;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "vapi_assistant_id" text;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "system_prompt" text;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "menu_context" text;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "twilio_phone_number" text;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "forwarding_phone_number" text;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "business_hours" text;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();

