import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { paypalConfigured, createPayPalOrder } from '@/lib/paypal'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    if (!paypalConfigured()) {
      return Response.json({ error: 'PayPal payments are not available right now.' }, { status: 503 })
    }

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

    if (product.price === 0) {
      await prisma.purchase.create({
        data: { userId: user.id, productId, amount: 0, currency: 'usd' },
      })
      return Response.json({ free: true })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`

    const { orderId, approveUrl } = await createPayPalOrder({
      amount: product.price,
      currency: product.currency,
      productName: product.name,
      successUrl: `${appUrl}/api/checkout/paypal/capture?token={token}&userId=${user.id}&productId=${productId}`,
      cancelUrl: `${appUrl}/product/${productId}`,
      metadata: { userId: String(user.id), productId: String(productId) },
    })

    console.log(`[paypal] Created order ${orderId} for user ${user.id} product ${productId}`)
    return Response.json({ url: approveUrl, orderId })
  } catch (err) {
    console.error('[paypal/checkout] error:', err)
    return Response.json({ error: 'PayPal checkout failed' }, { status: 500 })
  }
}
