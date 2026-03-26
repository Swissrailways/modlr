import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { rateLimit } from '@/lib/rateLimit'

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'
  const limit = rateLimit(ip, 'delete-account', 3, 60 * 60 * 1000)
  if (!limit.allowed) {
    return Response.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }

  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.password) {
    return Response.json({ error: 'Password is required to delete your account' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const valid = await bcrypt.compare(body.password, user.password)
    if (!valid) {
      return Response.json({ error: 'Incorrect password' }, { status: 403 })
    }

    // Cascade deletes shop, products, purchases, tokens via DB relations
    await prisma.user.delete({ where: { id: session.userId } })

    await session.destroy()

    return Response.json({ success: true })
  } catch (err) {
    console.error('Delete account error:', err)
    return Response.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
