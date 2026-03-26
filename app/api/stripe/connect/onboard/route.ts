import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getStripe, stripeConfigured } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  if (!stripeConfigured()) {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  try {
    const shop = await prisma.shop.findUnique({ where: { userId: user.id } })
    if (!shop) return Response.json({ error: 'No shop found' }, { status: 404 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`
    const stripe = getStripe()

    // Create or reuse existing Stripe Connect account
    let accountId = shop.stripeAccountId
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        metadata: { shopId: String(shop.id), userId: String(user.id) },
      })
      accountId = account.id
      await prisma.shop.update({ where: { id: shop.id }, data: { stripeAccountId: accountId } })
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/api/stripe/connect/refresh?shop_id=${shop.id}`,
      return_url: `${appUrl}/api/stripe/connect/return?shop_id=${shop.id}`,
      type: 'account_onboarding',
    })

    return Response.json({ url: accountLink.url })
  } catch (err) {
    console.error('[stripe/connect/onboard]', err)
    return Response.json({ error: 'Failed to create onboarding link' }, { status: 500 })
  }
}
