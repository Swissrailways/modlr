import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/db'

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })
  return Response.json(tags)
}
