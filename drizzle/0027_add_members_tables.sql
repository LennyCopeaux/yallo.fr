-- Membres d'une organisation (supporte plusieurs propriétaires)
CREATE TABLE IF NOT EXISTS "organization_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" text DEFAULT 'owner' NOT NULL,
  "created_at" timestamp DEFAULT now()
);

-- Index unique pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS "organization_members_org_user_idx"
  ON "organization_members"("organization_id", "user_id");

-- Membres d'un restaurant (supporte plusieurs propriétaires)
CREATE TABLE IF NOT EXISTS "restaurant_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "restaurant_id" uuid NOT NULL REFERENCES "restaurants"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" text DEFAULT 'owner' NOT NULL,
  "created_at" timestamp DEFAULT now()
);

-- Index unique pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS "restaurant_members_restaurant_user_idx"
  ON "restaurant_members"("restaurant_id", "user_id");

-- Migrer les owner_id existants vers les tables membres
INSERT INTO "organization_members" ("organization_id", "user_id", "role")
SELECT "id", "owner_id", 'owner'
FROM "organizations"
WHERE "owner_id" IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO "restaurant_members" ("restaurant_id", "user_id", "role")
SELECT "id", "owner_id", 'owner'
FROM "restaurants"
WHERE "owner_id" IS NOT NULL
ON CONFLICT DO NOTHING;
