import { NextRequest } from 'next/server'
import { getStripe, stripeConfigured } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// Called from the success page to confirm payment and ensure purchase is recorded
// (handles the case where the webhook fires before or after the user lands on the success page)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionId = request.nextUrl.searchParams.get('session_id')
  if (!sessionId) return Response.json({ error: 'Missing session_id' }, { status: 400 })

  if (!stripeConfigured()) {
    return Response.json({ error: 'Payments not configured' }, { status: 503 })
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return Response.json({ paid: false, error: 'Payment not completed' }, { status: 402 })
    }

    const userId = parseInt(session.metadata?.userId ?? '')
    if (isNaN(userId)) {
      return Response.json({ error: 'Invalid session metadata' }, { status: 400 })
    }

    // Security: make sure the session belongs to the logged-in user
    if (userId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const isCart = session.metadata?.cartCheckout === 'true'

    if (isCart) {
      // Cart purchase — upsert all products
      const productIds = (session.metadata?.productIds ?? '')
        .split(',')
        .map(Number)
        .filter((n: number) => !isNaN(n) && n > 0)

      if (productIds.length === 0) {
        return Response.json({ error: 'Invalid cart session metadata' }, { status: 400 })
      }

      const perItem = Math.round((session.amount_total ?? 0) / productIds.length)
      const currency = session.currency ?? 'usd'

      await prisma.purchase.createMany({
        data: productIds.map((productId: number) => ({
          userId,
          productId,
          amount: perItem,
          currency,
          stripeSessionId: `${session.id}_${productId}`,
        })),
        skipDuplicates: true,
      })

      return Response.json({ paid: true })
    } else {
      // Single product purchase
      const productId = parseInt(session.metadata?.productId ?? '')
      if (isNaN(productId)) {
        return Response.json({ error: 'Invalid session metadata' }, { status: 400 })
      }

      await prisma.purchase.upsert({
        where: { userId_productId: { userId, productId } },
        update: {},
        create: {
          userId,
          productId,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? 'usd',
          stripeSessionId: session.id,
        },
      })

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, shop: { select: { name: true, slug: true } } },
      })

      return Response.json({ paid: true, product })
    }
  } catch (err) {
    console.error('GET /api/checkout/verify error:', err)
    return Response.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}
