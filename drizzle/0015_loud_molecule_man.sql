CREATE TABLE "pricing_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
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
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pricing_plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "restaurants" DROP CONSTRAINT "restaurants_slug_unique";--> statement-breakpoint
ALTER TABLE "restaurants" DROP COLUMN "slug";