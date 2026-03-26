import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.product.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.price !== undefined && { price: Math.round(body.price) }),
      ...(body.published !== undefined && { published: body.published }),
    },
    select: { id: true, name: true, price: true, published: true },
  })
  return Response.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.product.delete({ where: { id: parseInt(id) } })
  return Response.json({ success: true })
}
