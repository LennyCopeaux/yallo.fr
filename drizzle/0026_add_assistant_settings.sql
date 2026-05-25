ALTER TABLE "restaurants" ADD COLUMN "elevenlabs_voice_id" text;
ALTER TABLE "restaurants" ADD COLUMN "upsell_enabled" boolean NOT NULL DEFAULT false;
ALTER TABLE "restaurants" ADD COLUMN "sms_confirmation_enabled" boolean NOT NULL DEFAULT false;
ALTER TABLE "restaurants" ADD COLUMN "auto_rush_threshold" integer;
