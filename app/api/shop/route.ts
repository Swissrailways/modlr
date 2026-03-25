import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

function slugify(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const shop = await prisma.shop.findUnique({
      where: { userId: user.id },
      include: { _count: { select: { products: true } } },
    })
    return Response.json(shop)
  } catch (err) {
    console.error('GET /api/shop error:', err)
    return Response.json({ error: 'Failed to fetch shop' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name?: string; description?: string }
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, description } = body
  if (!name?.trim()) return Response.json({ error: 'Shop name is required' }, { status: 400 })

  const trimmedName = name.trim()
  if (trimmedName.length > 60) {
    return Response.json({ error: 'Shop name must be 60 characters or less' }, { status: 400 })
  }

  try {
    let slug = slugify(trimmedName)
    if (!slug) return Response.json({ error: 'Shop name produces an invalid slug' }, { status: 400 })

    // Add timestamp suffix if slug is taken — avoids the check-then-create race
    const slugExists = await prisma.shop.findUnique({ where: { slug } })
    if (slugExists) slug = `${slug}-${Date.now()}`

    const shop = await prisma.shop.create({
      data: { userId: user.id, name: trimmedName, slug, description: description?.trim() || null },
      include: { _count: { select: { products: true } } },
    })
    return Response.json(shop, { status: 201 })
  } catch (err: any) {
    // Unique constraint on userId — user already has a shop (race condition safe)
    if (err?.code === 'P2002') {
      return Response.json({ error: 'You already have a shop' }, { status: 409 })
    }
    console.error('POST /api/shop error:', err)
    return Response.json({ error: 'Failed to create shop' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name?: string; description?: string }
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const shop = await prisma.shop.update({
      where: { userId: user.id },
      data: {
        ...(body.name?.trim() && { name: body.name.trim() }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
      },
      include: { _count: { select: { products: true } } },
    })
    return Response.json(shop)
  } catch (err) {
    console.error('PATCH /api/shop error:', err)
    return Response.json({ error: 'Failed to update shop' }, { status: 500 })
  }
}
