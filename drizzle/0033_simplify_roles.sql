-- Remove scope and is_system columns from roles table
-- Access control is now enforced via the user role enum, not role metadata
ALTER TABLE "roles" DROP COLUMN IF EXISTS "scope";
ALTER TABLE "roles" DROP COLUMN IF EXISTS "is_system";
