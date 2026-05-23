ALTER TABLE "restaurants" ADD COLUMN "forwarding_phone_number" text;
ALTER TABLE "restaurants" ADD COLUMN "call_forwarding_enabled" boolean DEFAULT false NOT NULL;
