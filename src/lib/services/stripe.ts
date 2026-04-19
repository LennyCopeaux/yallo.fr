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
      apiVersion: "2025-03-31.basil",
      typescript: true,
    });
  }
  return stripeClient;
}
