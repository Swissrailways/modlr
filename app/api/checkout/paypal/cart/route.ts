import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { paypalConfigured, createPayPalOrder } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    if (!paypalConfigured()) {
      return Response.json({ error: 'PayPal is not available right now.' }, { status: 503 })
    }

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

    const purchases = await prisma.purchase.findMany({
      where: { userId: user.id, productId: { in: productIds } },
    })
    const purchasedIds = new Set(purchases.map(p => p.productId))
    const unpurchased = products.filter(p => !purchasedIds.has(p.id))

    if (unpurchased.length === 0) {
      return Response.json({ error: 'All items already purchased' }, { status: 409 })
    }

    const allFree = unpurchased.every(p => p.price === 0)
    if (allFree) {
      await prisma.purchase.createMany({
        data: unpurchased.map(p => ({ userId: user.id, productId: p.id, amount: 0, currency: 'usd' })),
        skipDuplicates: true,
      })
      return Response.json({ allFree: true })
    }

    const total = unpurchased.reduce((sum, p) => sum + p.price, 0)
    const currency = unpurchased[0].currency
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`
    const productIdsStr = unpurchased.map(p => p.id).join(',')

    const { approveUrl } = await createPayPalOrder({
      amount: total,
      currency,
      productName: unpurchased.length === 1 ? unpurchased[0].name : `${unpurchased.length} items from Modlr`,
      successUrl: `${appUrl}/api/checkout/paypal/capture-cart?token={token}&userId=${user.id}&productIds=${productIdsStr}`,
      cancelUrl: `${appUrl}/?cart=cancelled`,
      metadata: { userId: String(user.id), productIds: productIdsStr },
    })

    return Response.json({ url: approveUrl })
  } catch (err) {
    console.error('[paypal/cart] error:', err)
    return Response.json({ error: 'PayPal checkout failed' }, { status: 500 })
  }
}
