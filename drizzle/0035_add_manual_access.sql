ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS manual_access_enabled BOOLEAN NOT NULL DEFAULT false;
