ALTER TABLE restaurants
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS stripe_subscription_status,
  DROP COLUMN IF EXISTS stripe_price_id,
  DROP COLUMN IF EXISTS stripe_current_period_end,
  DROP COLUMN IF EXISTS billing_start_date;
