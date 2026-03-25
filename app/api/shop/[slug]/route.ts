import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { serializeProduct } from '../../products/route'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const shop = await prisma.shop.findUnique({
      where: { slug },
      include: {
        user: { select: { username: true, createdAt: true } },
        products: {
          where: { published: true },
          select: {
            id: true, name: true, description: true, price: true, currency: true,
            fileName: true, fileSize: true, mimeType: true, published: true,
            createdAt: true, updatedAt: true,
            shop: { select: { id: true, name: true, slug: true } },
            category: { select: { id: true, name: true, slug: true } },
            tags: { include: { tag: true } },
            previewImages: { orderBy: { order: 'asc' as const } },
            _count: { select: { purchases: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!shop) return Response.json({ error: 'Shop not found' }, { status: 404 })

    return Response.json({
      ...shop,
      products: shop.products.map(serializeProduct),
    })
  } catch (err) {
    console.error('GET /api/shop/[slug] error:', err)
    return Response.json({ error: 'Failed to fetch shop' }, { status: 500 })
  }
}
