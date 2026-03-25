import { prisma } from '@/lib/db'
import { serializeProduct } from '../products/route'
import { signPreviewPath } from '@/lib/previewToken'

export async function GET() {
  try {
    const shops = await prisma.shop.findMany({
      where: {
        products: { some: { published: true } },
      },
      include: {
        user: { select: { username: true } },
        _count: { select: { products: { where: { published: true } } } },
        products: {
          where: { published: true },
          orderBy: { createdAt: 'desc' },
          take: 4,
          select: {
            id: true, name: true, price: true, currency: true,
            fileName: true, fileSize: true, mimeType: true,
            description: true, published: true, createdAt: true, updatedAt: true,
            shop: { select: { id: true, name: true, slug: true } },
            category: { select: { id: true, name: true, slug: true } },
            tags: { include: { tag: true } },
            previewImages: { orderBy: { order: 'asc' }, take: 1 },
            _count: { select: { purchases: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json(shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      description: shop.description,
      logoPath: shop.logoPath,
      bannerPath: shop.bannerPath,
      createdAt: shop.createdAt,
      owner: shop.user.username,
      productCount: shop._count.products,
      previews: shop.products
        .map(p => serializeProduct(p))
        .filter(p => p.previewImages.length > 0)
        .slice(0, 3)
        .map(p => p.previewImages[0]?.url ?? signPreviewPath(p.previewImages[0]?.path))
        .filter(Boolean),
      latestProducts: shop.products.map(p => serializeProduct(p)),
    })))
  } catch (err) {
    console.error('GET /api/shops error:', err)
    return Response.json({ error: 'Failed to fetch shops' }, { status: 500 })
  }
}
