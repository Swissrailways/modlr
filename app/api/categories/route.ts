import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/adminAuth'

function slugify(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    return Response.json(categories)
  } catch (err) {
    console.error('GET /api/categories error:', err)
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  let body: { name?: string }
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.name?.trim()) return Response.json({ error: 'Name is required' }, { status: 400 })

  try {
    let slug = slugify(body.name)
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const category = await prisma.category.create({
      data: { name: body.name.trim(), slug },
    })
    return Response.json(category, { status: 201 })
  } catch (err) {
    console.error('POST /api/categories error:', err)
    return Response.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
