CREATE TYPE "public"."kitchen_status" AS ENUM('CALM', 'NORMAL', 'RUSH', 'STOP');--> statement-breakpoint
DROP TABLE "categories" CASCADE;--> statement-breakpoint
DROP TABLE "ingredient_categories" CASCADE;--> statement-breakpoint
DROP TABLE "ingredients" CASCADE;--> statement-breakpoint
DROP TABLE "modifier_groups" CASCADE;--> statement-breakpoint
DROP TABLE "modifiers" CASCADE;--> statement-breakpoint
DROP TABLE "product_variations" CASCADE;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "menu_data" jsonb;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "current_status" "kitchen_status" DEFAULT 'CALM' NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "status_settings" jsonb;