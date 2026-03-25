import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripe, stripeConfigured } from '@/lib/stripe'

// POST — create or resume a Stripe Connect onboarding link
export async function POST() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  if (!stripeConfigured()) {
    return Response.json({ error: 'Stripe is not configured. Add your STRIPE_SECRET_KEY to .env' }, { status: 503 })
  }

  try {
    const shop = await prisma.shop.findUnique({ where: { userId: user.id } })
    if (!shop) return Response.json({ error: 'Create a shop first' }, { status: 403 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Create a Stripe Express account if the seller doesn't have one yet
    let accountId = shop.stripeAccountId
    if (!accountId) {
      const account = await stripe.accounts.create({ type: 'express' })
      accountId = account.id
      await prisma.shop.update({
        where: { id: shop.id },
        data: { stripeAccountId: accountId },
      })
    }

    // Generate a fresh onboarding link (they expire after a few minutes)
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/dashboard/connect/refresh`,
      return_url: `${appUrl}/dashboard/connect/return`,
      type: 'account_onboarding',
    })

    return Response.json({ url: accountLink.url })
  } catch (err) {
    console.error('POST /api/shop/connect error:', err)
    return Response.json({ error: 'Failed to create Stripe Connect link' }, { status: 500 })
  }
}

// GET — check current connect status
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const shop = await prisma.shop.findUnique({ where: { userId: user.id } })
    if (!shop) return Response.json({ connected: false, complete: false })
    if (!shop.stripeAccountId) return Response.json({ connected: false, complete: false })

    // If Stripe isn't configured yet, return the DB-cached status
    if (!stripeConfigured()) {
      return Response.json({
        connected: !!shop.stripeAccountId,
        complete: shop.stripeAccountComplete,
        unconfigured: true,
      })
    }

    // Live check with Stripe
    const account = await stripe.accounts.retrieve(shop.stripeAccountId)
    const complete = !!(account.details_submitted && !(account.requirements?.currently_due?.length))

    // Sync to DB if status changed
    if (complete !== shop.stripeAccountComplete) {
      await prisma.shop.update({
        where: { id: shop.id },
        data: { stripeAccountComplete: complete },
      })
    }

    return Response.json({
      connected: true,
      complete,
      accountId: shop.stripeAccountId,
    })
  } catch (err) {
    console.error('GET /api/shop/connect error:', err)
    // Return DB-cached status rather than crashing the dashboard
    try {
      const shop = await prisma.shop.findUnique({ where: { userId: user.id } })
      return Response.json({
        connected: !!shop?.stripeAccountId,
        complete: shop?.stripeAccountComplete ?? false,
      })
    } catch {
      return Response.json({ connected: false, complete: false })
    }
  }
}
