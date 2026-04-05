import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const userId = parseInt(id)
  if (userId === admin.id) return Response.json({ error: 'Cannot delete your own account' }, { status: 400 })

  // Collect all product IDs from this user's shop
  const shopProducts = await prisma.product.findMany({
    where: { shop: { userId } },
    select: { id: true },
  })
  const productIds = shopProducts.map(p => p.id)

  // Delete earnings tied to user's products or user's own purchases
  await prisma.sellerEarning.deleteMany({
    where: { OR: [{ productId: { in: productIds } }, { purchase: { userId } }] },
  })
  // Delete purchases of user's products and purchases made by user
  await prisma.purchase.deleteMany({
    where: { OR: [{ productId: { in: productIds } }, { userId }] },
  })
  // Delete user — cascades shop → products → images/tags, tokens, etc.
  await prisma.user.delete({ where: { id: userId } })
  return Response.json({ success: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const userId = parseInt(id)

  let body: { isAdmin?: unknown }
  try { body = await req.json() } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (typeof body.isAdmin !== 'boolean') {
    return Response.json({ error: 'isAdmin must be a boolean' }, { status: 400 })
  }

  if (userId === admin.id && body.isAdmin === false) {
    return Response.json({ error: 'Cannot remove your own admin role' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isAdmin: body.isAdmin },
    select: { id: true, isAdmin: true },
  })
  return Response.json(user)
}
