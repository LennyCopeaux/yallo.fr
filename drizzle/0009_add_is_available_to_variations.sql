ALTER TABLE "product_variations" ADD COLUMN IF NOT EXISTS "is_available" boolean DEFAULT true NOT NULL;

