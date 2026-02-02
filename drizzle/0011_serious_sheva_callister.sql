ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "hubrise_location_id" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "hubrise_access_token" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "hubrise_catalog_cache" jsonb;--> statement-breakpoint
ALTER TABLE "ingredients" DROP COLUMN IF EXISTS "image_url";