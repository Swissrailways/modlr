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
    const accountLink = await stripe.accountLinks.create({
      account: shop.stripeAccountId,
      refresh_url: `${appUrl}/api/stripe/connect/refresh?shop_id=${shop.id}`,
      return_url: `${appUrl}/api/stripe/connect/return?shop_id=${shop.id}`,
      type: 'account_onboarding',
    })

    return Response.redirect(accountLink.url)
  } catch (err) {
    console.error('[stripe/connect/refresh]', err)
    return Response.redirect(`${appUrl}/dashboard/shop?stripe=error`)
  }
}
