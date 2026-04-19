import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return key;
}

export function getStripeServerClient(): Stripe {
  if (!stripeClient) {
    // Le SDK Stripe reste côté serveur uniquement (aucune clé exposée au client).
    stripeClient = new Stripe(getStripeSecretKey(), {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return stripeClient;
}
