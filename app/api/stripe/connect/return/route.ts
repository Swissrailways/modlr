import { NextRequest } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const shopId = parseInt(req.nextUrl.searchParams.get('shop_id') ?? '')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`

  if (isNaN(shopId)) return Response.redirect(`${appUrl}/dashboard/shop`)

  try {
    const shop = await prisma.shop.findUnique({ where: { id: shopId } })
    if (!shop?.stripeAccountId) return Response.redirect(`${appUrl}/dashboard/shop`)

    const stripe = getStripe()
    const account = await stripe.accounts.retrieve(shop.stripeAccountId)
    const complete = account.details_submitted && account.charges_enabled

    await prisma.shop.update({
      where: { id: shopId },
      data: { stripeAccountComplete: complete },
    })

    return Response.redirect(`${appUrl}/dashboard/shop?stripe=${complete ? 'connected' : 'pending'}`)
  } catch (err) {
    console.error('[stripe/connect/return]', err)
    return Response.redirect(`${appUrl}/dashboard/shop?stripe=error`)
  }
}
