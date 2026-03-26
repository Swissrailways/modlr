import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/db'

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const since = new Date(Date.now() - 2 * 60 * 1000)

  const [users, shops, products, purchases, activeVisitors] = await Promise.all([
    prisma.user.count(),
    prisma.shop.count(),
    prisma.product.count(),
    prisma.purchase.aggregate({ _sum: { amount: true }, _count: true }),
    prisma.activeVisitor.count({ where: { lastSeen: { gte: since } } }),
  ])

  return Response.json({
    users,
    shops,
    products,
    totalRevenue: purchases._sum.amount ?? 0,
    totalSales: purchases._count,
    activeVisitors,
  })
}
