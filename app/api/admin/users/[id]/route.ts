import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const userId = parseInt(id)
  if (userId === admin.id) return Response.json({ error: 'Cannot delete your own account' }, { status: 400 })

  await prisma.user.delete({ where: { id: userId } })
  return Response.json({ success: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data: { isAdmin: body.isAdmin },
    select: { id: true, isAdmin: true },
  })
  return Response.json(user)
}
