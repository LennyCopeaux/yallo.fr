CREATE TABLE IF NOT EXISTS "roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "scope" text NOT NULL DEFAULT 'both',
  "is_system" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now()
);

ALTER TABLE "roles" ADD CONSTRAINT "roles_name_unique" UNIQUE("name");

-- Seed system roles
INSERT INTO "roles" ("name", "description", "scope", "is_system") VALUES
  ('ADMIN', 'Accès complet au panel admin, toutes les organisations et tous les restaurants.', 'both', true),
  ('OWNER', 'Accès à son organisation et à ses restaurants. Gestion complète.', 'both', true),
  ('EMPLOYEE', 'Accès à un ou plusieurs restaurants au sein d''une organisation. Droits limités (commandes + statut cuisine).', 'restaurant', true)
ON CONFLICT ("name") DO NOTHING;
