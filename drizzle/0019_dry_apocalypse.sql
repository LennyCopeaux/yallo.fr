ALTER TABLE "pricing_plans" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "pricing_plans" CASCADE;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "stripe_subscription_status" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "stripe_price_id" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "stripe_current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "vapi_structured_output_ids" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "vapi_phone_number_id" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "elevenlabs_agent_id" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "elevenlabs_phone_number_id" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "hubrise_catalog_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "auth_user_id" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_hash";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "must_change_password";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "reset_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "reset_token_expires";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_auth_user_id_unique" UNIQUE("auth_user_id");