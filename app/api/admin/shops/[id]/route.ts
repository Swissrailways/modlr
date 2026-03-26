import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const shopId = parseInt(id)

  // Collect all product IDs in this shop
  const products = await prisma.product.findMany({
    where: { shopId },
    select: { id: true },
  })
  const productIds = products.map(p => p.id)

  // Delete earnings and purchases tied to these products
  await prisma.sellerEarning.deleteMany({ where: { OR: [{ productId: { in: productIds } }, { shopId }] } })
  await prisma.purchase.deleteMany({ where: { productId: { in: productIds } } })

  // Delete shop — cascades products → images/tags
  await prisma.shop.delete({ where: { id: shopId } })
  return Response.json({ success: true })
}
