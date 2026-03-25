import Stripe from 'stripe'

// Use the SDK's built-in latest API version to avoid version mismatch issues
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder')

export function stripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? ''
  return key.startsWith('sk_test_') || key.startsWith('sk_live_')
}
