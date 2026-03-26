import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getStripe, stripeConfigured } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { productIds } = await req.json() as { productIds: number[] }
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, published: true },
      include: { shop: true },
    })

    if (products.length === 0) {
      return Response.json({ error: 'No valid products found' }, { status: 404 })
    }

    // Skip already-purchased products
    const purchases = await prisma.purchase.findMany({
      where: { userId: user.id, productId: { in: productIds } },
    })
    const purchasedIds = new Set(purchases.map(p => p.productId))
    const unpurchased = products.filter(p => !purchasedIds.has(p.id))

    if (unpurchased.length === 0) {
      return Response.json({ error: 'All items already purchased' }, { status: 409 })
    }

    // Free-only cart
    const allFree = unpurchased.every(p => p.price === 0)
    if (allFree) {
      await prisma.purchase.createMany({
        data: unpurchased.map(p => ({ userId: user.id, productId: p.id, amount: 0, currency: 'usd' })),
        skipDuplicates: true,
      })
      return Response.json({ allFree: true })
    }

    if (!stripeConfigured()) {
      return Response.json({ error: 'Card payments are not available right now.' }, { status: 503 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: unpurchased.map(p => ({
        price_data: {
          currency: p.currency,
          unit_amount: p.price,
          product_data: {
            name: p.name,
            description: `by ${p.shop.name}`,
          },
        },
        quantity: 1,
      })),
      metadata: {
        userId: String(user.id),
        productIds: unpurchased.map(p => p.id).join(','),
        cartCheckout: 'true',
      },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?cart=cancelled`,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('[checkout/cart] error:', err)
    return Response.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
