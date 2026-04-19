ALTER TABLE "restaurants" ADD COLUMN "stripe_subscription_id" text;
ALTER TABLE "restaurants" ADD COLUMN "stripe_subscription_status" text;
ALTER TABLE "restaurants" ADD COLUMN "stripe_price_id" text;
ALTER TABLE "restaurants" ADD COLUMN "stripe_current_period_end" timestamp;
