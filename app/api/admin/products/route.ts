import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/db'

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, price: true, currency: true,
      published: true, createdAt: true,
      shop: { select: { name: true, slug: true } },
      category: { select: { name: true } },
      _count: { select: { purchases: true } },
    },
  })

  return Response.json(products)
}
