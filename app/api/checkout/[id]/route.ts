import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { getStripe, stripeConfigured } from '@/lib/stripe'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

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

    const existing = await prisma.purchase.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    })
    if (existing) return Response.json({ error: 'Already purchased' }, { status: 409 })

    // Free product — instant purchase
    if (product.price === 0) {
      await prisma.purchase.create({
        data: { userId: user.id, productId, amount: 0, currency: 'usd' },
      })
      return Response.json({ free: true })
    }

    if (!stripeConfigured()) {
      return Response.json({ error: 'Payments are not available right now.' }, { status: 503 })
    }

    // Stripe minimum charge is 50 cents / 50 rappen in any currency
    if (product.price < 50) {
      return Response.json({ error: 'Product price is below the minimum charge amount ($0.50). Please update the product price.' }, { status: 422 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`

    // All payments go to platform — seller payout handled separately
    const session = await getStripe().checkout.sessions.create({
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
      metadata: { userId: String(user.id), productId: String(productId) },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/product/${productId}`,
    })

    return Response.json({ url: session.url })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[checkout] error:', msg)
    return Response.json({ error: msg || 'Checkout failed' }, { status: 500 })
  }
}
