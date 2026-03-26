import { NextRequest } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

// This must be raw body — do NOT parse as JSON
export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') ?? ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

  if (!webhookSecret || webhookSecret === 'whsec_placeholder') {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return Response.json({ error: 'Webhook secret not configured' }, { status: 503 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = parseInt((session.metadata as any)?.userId ?? '')
    const isCart = (session.metadata as any)?.cartCheckout === 'true'

    if (isNaN(userId)) {
      console.error('Webhook: missing userId in session metadata', session.id)
      return Response.json({ received: true })
    }

    if (session.payment_status !== 'paid') {
      console.log('Webhook: session not paid yet, skipping', session.id)
      return Response.json({ received: true })
    }

    try {
      if (isCart) {
        // Cart checkout — multiple products
        const productIdsStr = (session.metadata as any)?.productIds ?? ''
        const productIds = productIdsStr.split(',').map(Number).filter((n: number) => !isNaN(n))
        const perItem = Math.round((session.amount_total ?? 0) / productIds.length)
        await prisma.purchase.createMany({
          data: productIds.map((productId: number) => ({
            userId, productId,
            amount: perItem,
            currency: session.currency ?? 'usd',
            stripeSessionId: `${session.id}_${productId}`,
          })),
          skipDuplicates: true,
        })
        console.log(`Cart purchase recorded: user=${userId} products=${productIdsStr} session=${session.id}`)
      } else {
        // Single product checkout
        const productId = parseInt((session.metadata as any)?.productId ?? '')
        if (isNaN(productId)) {
          console.error('Webhook: missing productId in session metadata', session.id)
          return Response.json({ received: true })
        }
        await prisma.purchase.upsert({
          where: { userId_productId: { userId, productId } },
          update: {},
          create: {
            userId, productId,
            amount: session.amount_total ?? 0,
            currency: session.currency ?? 'usd',
            stripeSessionId: session.id,
          },
        })
        console.log(`Purchase recorded: user=${userId} product=${productId} session=${session.id}`)
      }
    } catch (err) {
      console.error('Webhook: failed to create purchase:', err)
      return Response.json({ error: 'Failed to record purchase' }, { status: 500 })
    }
  }

  return Response.json({ received: true })
}
