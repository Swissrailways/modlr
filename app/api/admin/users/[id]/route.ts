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
  const body = await req.json()
  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data: { isAdmin: body.isAdmin },
    select: { id: true, isAdmin: true },
  })
  return Response.json(user)
}
