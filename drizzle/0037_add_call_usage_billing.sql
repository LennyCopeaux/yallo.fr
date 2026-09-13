-- Facturation des minutes d'appel : on marque chaque appel deja porte sur une
-- facture Stripe. Facturer "tout ce qui n'est pas encore facture" evite a la
-- fois les doublons et les trous, sans calcul de periode fragile.
ALTER TABLE call_logs
  ADD COLUMN IF NOT EXISTS billed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;

-- Selection des appels restant a facturer pour une organisation.
CREATE INDEX IF NOT EXISTS "call_logs_organization_id_billed_at_idx"
  ON "call_logs" ("organization_id", "billed_at");
