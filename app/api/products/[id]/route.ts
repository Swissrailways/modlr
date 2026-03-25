import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { deleteFile } from '@/lib/fileStorage'
import { serializeProduct } from '../route'

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  currency: true,
  filePath: true,
  fileName: true,
  fileSize: true,
  mimeType: true,
  published: true,
  createdAt: true,
  updatedAt: true,
  shop: { select: { id: true, name: true, slug: true, userId: true } },
  category: { select: { id: true, name: true, slug: true } },
  tags: { include: { tag: true } },
  previewImages: { orderBy: { order: 'asc' as const } },
  _count: { select: { purchases: true } },
}

function parseId(id: string) {
  const n = parseInt(id)
  return isNaN(n) || n <= 0 ? null : n
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseId(id)
    if (!productId) return Response.json({ error: 'Invalid ID' }, { status: 400 })

    const user = await getCurrentUser()

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: productSelect,
    })

    if (!product) return Response.json({ error: 'Not found' }, { status: 404 })
    if (!product.published && product.shop.userId !== user?.id) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    let purchased = false
    if (user) {
      if (product.price === 0) {
        purchased = true
      } else {
        const purchase = await prisma.purchase.findUnique({
          where: { userId_productId: { userId: user.id, productId } },
        })
        purchased = !!purchase
      }
    }

    return Response.json({ ...serializeProduct(product), purchased })
  } catch (err) {
    console.error('GET /api/products/[id] error:', err)
    return Response.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const productId = parseId(id)
    if (!productId) return Response.json({ error: 'Invalid ID' }, { status: 400 })

    const product = await prisma.product.findUnique({ where: { id: productId }, include: { shop: true } })
    if (!product) return Response.json({ error: 'Not found' }, { status: 404 })
    if (product.shop.userId !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 })

    let body: {
      name?: string; description?: string; price?: number
      tags?: string[]; categoryId?: number | null; published?: boolean
    }
    try { body = await request.json() } catch {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { name, description, price, tags, categoryId, published } = body

    if (name !== undefined && !name.trim()) {
      return Response.json({ error: 'Name cannot be empty' }, { status: 400 })
    }
    if (name !== undefined && name.trim().length > 120) {
      return Response.json({ error: 'Name must be 120 characters or less' }, { status: 400 })
    }
    if (price !== undefined && (typeof price !== 'number' || !isFinite(price) || price < 0 || price > 1_000_000)) {
      return Response.json({ error: 'Invalid price — must be between $0 and $10,000' }, { status: 400 })
    }
    if (tags !== undefined && !Array.isArray(tags)) {
      return Response.json({ error: 'Tags must be an array' }, { status: 400 })
    }
    if (tags !== undefined && tags.length > 20) {
      return Response.json({ error: 'Maximum 20 tags allowed' }, { status: 400 })
    }

    const tagRecords = tags ? await Promise.all(
      tags.map((t: string) => prisma.tag.upsert({
        where: { name: t.toLowerCase().trim() },
        update: {},
        create: { name: t.toLowerCase().trim() },
      }))
    ) : undefined

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(price !== undefined && { price: Math.round(price) }),
        ...(published !== undefined && { published }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(tagRecords && {
          tags: { deleteMany: {}, create: tagRecords.map(t => ({ tagId: t.id })) },
        }),
      },
      select: productSelect,
    })

    return Response.json(serializeProduct(updated))
  } catch (err) {
    console.error('PATCH /api/products/[id] error:', err)
    return Response.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const productId = parseId(id)
    if (!productId) return Response.json({ error: 'Invalid ID' }, { status: 400 })

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { shop: true, previewImages: true },
    })
    if (!product) return Response.json({ error: 'Not found' }, { status: 404 })
    if (product.shop.userId !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 })

    await deleteFile(product.filePath)
    for (const img of product.previewImages) {
      await deleteFile(img.path)
    }

    await prisma.product.delete({ where: { id: productId } })
    return Response.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/products/[id] error:', err)
    return Response.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
