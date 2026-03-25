import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            shop: { select: { name: true, slug: true } },
            previewImages: { orderBy: { order: 'asc' }, take: 1 },
            tags: { include: { tag: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter out purchases where the product was deleted
    const valid = purchases.filter(p => p.product !== null)

    return Response.json(
      valid.map(p => ({
        ...p,
        product: {
          ...p.product,
          fileSize: p.product!.fileSize?.toString() ?? '0',
          tags: p.product!.tags.map(pt => pt.tag.name),
        },
      }))
    )
  } catch (err) {
    console.error('GET /api/library error:', err)
    return Response.json({ error: 'Failed to fetch library' }, { status: 500 })
  }
}
