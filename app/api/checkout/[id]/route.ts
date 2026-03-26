import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { stripe, stripeConfigured } from '@/lib/stripe'

// Platform fee: 10% (900 = 90% goes to seller)
const PLATFORM_FEE_PERCENT = 10

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const user = await getCurrentUser()
  console.log('[checkout] user:', user?.id ?? 'none')
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const productId = parseInt(id)
    console.log('[checkout] productId:', productId)
    if (isNaN(productId) || productId <= 0) {
      return Response.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId, published: true },
      include: { shop: true },
    })
    console.log('[checkout] product:', product?.id ?? 'not found')
    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 })

    // Check if already purchased
    const existing = await prisma.purchase.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    })
    console.log('[checkout] existing purchase:', !!existing)
    if (existing) return Response.json({ error: 'Already purchased' }, { status: 409 })

    // Free product — create purchase directly, no payment needed
    if (product.price === 0) {
      await prisma.purchase.create({
        data: { userId: user.id, productId, amount: 0, currency: 'usd' },
      })
      return Response.json({ free: true })
    }

    // Paid product — Stripe must be configured
    console.log('[checkout] stripeConfigured:', stripeConfigured())
    if (!stripeConfigured()) {
      return Response.json({ error: 'Payments are not available right now. Please try again later.' }, { status: 503 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
      ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`

    const isLive = (process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_live_')
    const hasConnect = !!(product.shop.stripeAccountId && product.shop.stripeAccountComplete)

    // Platform fee in cents
    const platformFee = Math.round(product.price * PLATFORM_FEE_PERCENT / 100)

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: product.currency,
          unit_amount: product.price,
          product_data: {
            name: product.name,
            description: product.description ?? undefined,
          },
        },
        quantity: 1,
      }],
      payment_intent_data: {
        // Only split to seller when in live mode AND seller has connected their account
        ...(isLive && hasConnect ? {
          transfer_data: { destination: product.shop.stripeAccountId! },
          application_fee_amount: platformFee,
        } : {}),
      },
      metadata: { userId: String(user.id), productId: String(productId) },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/product/${productId}`,
    })

    return Response.json({ url: session.url })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[checkout] CRASH:', msg)
    if (msg.includes('STRIPE_SECRET_KEY')) {
      return Response.json({ error: 'Payments are not available right now.' }, { status: 503 })
    }
    return Response.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
