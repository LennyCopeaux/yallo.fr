-- Index de performance sur les cles etrangeres et les colonnes de tri.
-- La base Supabase recreee ne contenait que les cles primaires et les
-- contraintes d'unicite : chaque jointure du dashboard faisait un scan
-- sequentiel. Invisible sur quelques lignes, tres couteux en production.
--
-- Purement additif et idempotent : aucun impact sur les donnees.

-- Dashboard restaurant : filtre par restaurant + tri par date.
CREATE INDEX IF NOT EXISTS "orders_restaurant_id_created_at_idx"
  ON "orders" ("restaurant_id", "created_at" DESC);

-- Chargement des articles d'une commande (Drizzle `with: { items: true }`).
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx"
  ON "order_items" ("order_id");

-- Statistiques d'appels par restaurant sur une plage de dates.
CREATE INDEX IF NOT EXISTS "call_logs_restaurant_id_created_at_idx"
  ON "call_logs" ("restaurant_id", "created_at");

-- Consommation facturable par organisation sur la periode de facturation.
CREATE INDEX IF NOT EXISTS "call_logs_organization_id_created_at_idx"
  ON "call_logs" ("organization_id", "created_at");

-- Restaurants d'une organisation / d'un proprietaire.
CREATE INDEX IF NOT EXISTS "restaurants_organization_id_idx"
  ON "restaurants" ("organization_id");
CREATE INDEX IF NOT EXISTS "restaurants_owner_id_idx"
  ON "restaurants" ("owner_id");

-- Jointure organisations -> proprietaire.
CREATE INDEX IF NOT EXISTS "organizations_owner_id_idx"
  ON "organizations" ("owner_id");

-- Resolution des droits d'acces (appelee a chaque requete authentifiee).
CREATE INDEX IF NOT EXISTS "organization_members_user_id_idx"
  ON "organization_members" ("user_id");
CREATE INDEX IF NOT EXISTS "organization_members_organization_id_idx"
  ON "organization_members" ("organization_id");
CREATE INDEX IF NOT EXISTS "restaurant_members_user_id_idx"
  ON "restaurant_members" ("user_id");
CREATE INDEX IF NOT EXISTS "restaurant_members_restaurant_id_idx"
  ON "restaurant_members" ("restaurant_id");
