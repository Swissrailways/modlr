import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { signPreviewPath } from '@/lib/previewToken'

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  currency: true,
  fileName: true,
  fileSize: true,
  mimeType: true,
  published: true,
  createdAt: true,
  updatedAt: true,
  shop: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
  tags: { include: { tag: true } },
  previewImages: { orderBy: { order: 'asc' as const } },
  _count: { select: { purchases: true } },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const q = searchParams.get('q') ?? ''
    const categoryId = searchParams.get('categoryId')
    const shopId = searchParams.get('shopId')
    const sort = searchParams.get('sort') ?? 'newest'

    const orderBy =
      sort === 'price_asc' ? { price: 'asc' as const }
      : sort === 'price_desc' ? { price: 'desc' as const }
      : { createdAt: 'desc' as const }

    const products = await prisma.product.findMany({
      where: {
        published: true,
        ...(q && {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { tags: { some: { tag: { name: { contains: q } } } } },
            { shop: { name: { contains: q } } },
          ],
        }),
        ...(categoryId && !isNaN(parseInt(categoryId)) && { categoryId: parseInt(categoryId) }),
        ...(shopId && !isNaN(parseInt(shopId)) && { shopId: parseInt(shopId) }),
      },
      select: productSelect,
      orderBy,
    })

    return Response.json(products.map(serializeProduct))
  } catch (err) {
    console.error('GET /api/products error:', err)
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const shop = await prisma.shop.findUnique({ where: { userId: user.id } })
    if (!shop) return Response.json({ error: 'You must create a shop first' }, { status: 403 })

    let body: {
      name?: string; description?: string; price?: number
      tags?: string[]; categoryId?: number | null
      filePath?: string; fileName?: string; fileSize?: number; mimeType?: string
      previewPaths?: string[]
    }
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { name, description, price = 0, tags = [], categoryId, filePath, fileName, fileSize, mimeType, previewPaths = [] } = body

    if (!name?.trim()) return Response.json({ error: 'Name is required' }, { status: 400 })
    if (name.trim().length > 120) return Response.json({ error: 'Name must be 120 characters or less' }, { status: 400 })
    if (!filePath || !fileName) return Response.json({ error: 'File is required' }, { status: 400 })
    if (typeof price !== 'number' || price < 0 || !isFinite(price)) {
      return Response.json({ error: 'Invalid price' }, { status: 400 })
    }
    // Max price: $10,000 (in cents)
    if (price > 1_000_000) return Response.json({ error: 'Price cannot exceed $10,000' }, { status: 400 })
    // Prevent path traversal via filePath — must be a simple filename with no slashes
    if (filePath.includes('/') || filePath.includes('\\') || filePath.includes('..')) {
      return Response.json({ error: 'Invalid file reference' }, { status: 400 })
    }

    const tagRecords = await Promise.all(
      tags.map((t: string) => prisma.tag.upsert({
        where: { name: t.toLowerCase().trim() },
        update: {},
        create: { name: t.toLowerCase().trim() },
      }))
    )

    const product = await prisma.product.create({
      data: {
        shopId: shop.id,
        name: name.trim(),
        description: description?.trim() || null,
        price: Math.round(price),
        filePath,
        fileName,
        fileSize: BigInt(fileSize ?? 0),
        mimeType: mimeType ?? 'application/octet-stream',
        categoryId: categoryId ?? null,
        tags: { create: tagRecords.map(t => ({ tagId: t.id })) },
        previewImages: {
          create: previewPaths.map((path, i) => ({ path, order: i })),
        },
      },
      select: productSelect,
    })

    return Response.json(serializeProduct(product), { status: 201 })
  } catch (err) {
    console.error('POST /api/products error:', err)
    return Response.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export function serializeProduct(p: any) {
  return {
    ...p,
    fileSize: p.fileSize?.toString() ?? '0',
    tags: p.tags?.map((pt: any) => pt.tag.name) ?? [],
    purchaseCount: p._count?.purchases ?? 0,
    _count: undefined,
    previewImages: p.previewImages?.map((img: any) => ({
      ...img,
      url: signPreviewPath(img.path),
    })) ?? [],
  }
}
