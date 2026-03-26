import Stripe from 'stripe'

export function stripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? ''
  return key.startsWith('sk_test_') || key.startsWith('sk_live_')
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key, { timeout: 10000 })
}

