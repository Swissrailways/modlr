import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { capturePayPalOrder } from '@/lib/paypal'

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`
  const token = req.nextUrl.searchParams.get('token')     // PayPal order token
  const userId = parseInt(req.nextUrl.searchParams.get('userId') ?? '')
  const productId = parseInt(req.nextUrl.searchParams.get('productId') ?? '')

  if (!token || isNaN(userId) || isNaN(productId)) {
    return Response.redirect(`${appUrl}/?paypal=error`)
  }

  try {
    const capture = await capturePayPalOrder(token)
    const status = capture?.status
    const amount = capture?.purchase_units?.[0]?.payments?.captures?.[0]?.amount

    if (status !== 'COMPLETED') {
      console.error('[paypal/capture] Not completed:', status)
      return Response.redirect(`${appUrl}/product/${productId}?paypal=failed`)
    }

    // Record purchase (idempotent upsert)
    await prisma.purchase.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: {
        userId,
        productId,
        amount: Math.round(parseFloat(amount?.value ?? '0') * 100),
        currency: (amount?.currency_code ?? 'usd').toLowerCase(),
        stripeSessionId: `paypal_${token}`,
      },
    })

    console.log(`[paypal/capture] Purchase recorded: user=${userId} product=${productId}`)
    return Response.redirect(`${appUrl}/success?paypal=1&product=${productId}`)
  } catch (err) {
    console.error('[paypal/capture] error:', err)
    return Response.redirect(`${appUrl}/product/${productId}?paypal=error`)
  }
}
