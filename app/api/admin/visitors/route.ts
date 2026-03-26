import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/db'

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const since = new Date(Date.now() - 2 * 60 * 1000)
    const visitors = await prisma.activeVisitor.findMany({
      where: { lastSeen: { gte: since } },
      orderBy: { lastSeen: 'desc' },
    })
    const byPath: Record<string, number> = {}
    for (const v of visitors) {
      byPath[v.path] = (byPath[v.path] ?? 0) + 1
    }
    return Response.json({ total: visitors.length, byPath })
  } catch {
    return Response.json({ total: 0, byPath: {} })
  }
}
