import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { stripe, stripeConfigured } from '@/lib/stripe'

// Platform fee: 10% (900 = 90% goes to seller)
const PLATFORM_FEE_PERCENT = 10

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const productId = parseInt(id)
    if (isNaN(productId) || productId <= 0) {
      return Response.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId, published: true },
      include: { shop: true },
    })
    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 })

    // Check if already purchased
    const existing = await prisma.purchase.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    })
    if (existing) return Response.json({ error: 'Already purchased' }, { status: 409 })

    // Free product — create purchase directly, no payment needed
    if (product.price === 0) {
      await prisma.purchase.create({
        data: { userId: user.id, productId, amount: 0, currency: 'usd' },
      })
      return Response.json({ free: true })
    }

    // Paid product — Stripe must be configured and seller must have Connect set up
    if (!stripeConfigured()) {
      return Response.json({ error: 'Payments are not configured on this server yet.' }, { status: 503 })
    }
    if (!product.shop.stripeAccountId || !product.shop.stripeAccountComplete) {
      return Response.json({
        error: 'This seller has not set up payments yet. Please check back later.',
      }, { status: 402 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Platform fee in cents
    const platformFee = Math.round(product.price * PLATFORM_FEE_PERCENT / 100)

    // Create Stripe Checkout Session with Connect transfer
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
        // In live mode: transfer to seller minus platform fee
        // In test mode: skip transfer_data if account lacks capabilities
        ...(process.env.NODE_ENV !== 'production' ? {} : {
          transfer_data: { destination: product.shop.stripeAccountId },
          application_fee_amount: platformFee,
        }),
      },
      metadata: { userId: String(user.id), productId: String(productId) },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/product/${productId}`,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('POST /api/checkout/[id] error:', err)
    return Response.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
