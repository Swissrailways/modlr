import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/db'

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, username: true, isAdmin: true,
      emailVerified: true, createdAt: true,
      _count: { select: { purchases: true } },
      shop: { select: { id: true, name: true, slug: true, _count: { select: { products: true } } } },
    },
  })

  return Response.json(users)
}
