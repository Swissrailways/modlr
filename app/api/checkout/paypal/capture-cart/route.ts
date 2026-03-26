import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { capturePayPalOrder } from '@/lib/paypal'

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`
  const token = req.nextUrl.searchParams.get('token')
  const userId = parseInt(req.nextUrl.searchParams.get('userId') ?? '')
  const productIdsStr = req.nextUrl.searchParams.get('productIds') ?? ''
  const productIds = productIdsStr.split(',').map(Number).filter(n => !isNaN(n))

  if (!token || isNaN(userId) || productIds.length === 0) {
    return Response.redirect(`${appUrl}/?paypal=error`)
  }

  try {
    const capture = await capturePayPalOrder(token)
    if (capture?.status !== 'COMPLETED') {
      return Response.redirect(`${appUrl}/?cart=failed`)
    }

    const amount = capture?.purchase_units?.[0]?.payments?.captures?.[0]?.amount
    const amountCents = Math.round(parseFloat(amount?.value ?? '0') * 100)
    const currency = (amount?.currency_code ?? 'usd').toLowerCase()

    await prisma.purchase.createMany({
      data: productIds.map(productId => ({
        userId,
        productId,
        amount: Math.round(amountCents / productIds.length),
        currency,
        stripeSessionId: `paypal_cart_${token}_${productId}`,
      })),
      skipDuplicates: true,
    })

    console.log(`[paypal/capture-cart] ${productIds.length} purchases for user ${userId}`)
    return Response.redirect(`${appUrl}/success?paypal=1&cart=1`)
  } catch (err) {
    console.error('[paypal/capture-cart] error:', err)
    return Response.redirect(`${appUrl}/?paypal=error`)
  }
}
