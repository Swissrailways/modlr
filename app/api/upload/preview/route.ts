import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateStorageKey, uploadImage } from '@/lib/fileStorage'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const shop = await prisma.shop.findUnique({ where: { userId: user.id } })
  if (!shop) return Response.json({ error: 'Shop required' }, { status: 403 })

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.includes('multipart/form-data')) {
    return Response.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const formData = await request.formData()
  const fileEntry = formData.get('file') as File | null
  if (!fileEntry) return Response.json({ error: 'No file provided' }, { status: 400 })

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(fileEntry.type)) {
    return Response.json({ error: 'Only JPEG, PNG, WebP or GIF images allowed' }, { status: 400 })
  }

  const MAX_SIZE = 10 * 1024 * 1024
  if (fileEntry.size > MAX_SIZE) {
    return Response.json({ error: 'Image exceeds 10 MB limit' }, { status: 413 })
  }

  const key = generateStorageKey(fileEntry.name)

  try {
    const buffer = Buffer.from(await fileEntry.arrayBuffer())
    await uploadImage(key, buffer, fileEntry.type)
  } catch (err) {
    console.error('Preview upload error:', err)
    return Response.json({ error: 'Failed to save image' }, { status: 500 })
  }

  return Response.json({ path: key })
}
