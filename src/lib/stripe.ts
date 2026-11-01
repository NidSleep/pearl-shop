import "server-only";
import Stripe from "stripe";
import { requireEnv } from "./env";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  stripe ??= new Stripe(requireEnv("STRIPE_SECRET_KEY"));
  return stripe;
}
