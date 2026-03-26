import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/db'

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })
  return Response.json(categories)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { name } = await req.json()
  if (!name?.trim()) return Response.json({ error: 'Name required' }, { status: 400 })
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const category = await prisma.category.create({ data: { name: name.trim(), slug } })
  return Response.json(category, { status: 201 })
}
