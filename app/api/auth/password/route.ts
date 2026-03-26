import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: { currentPassword?: string; newPassword?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { newPassword, currentPassword } = body

  if (!newPassword || newPassword.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  // If user already has a password, verify current one first
  if (user.password) {
    if (!currentPassword) {
      return Response.json({ error: 'Current password is required' }, { status: 400 })
    }
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return Response.json({ error: 'Current password is incorrect' }, { status: 403 })
    }
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: session.userId }, data: { password: hashed } })

  return Response.json({ ok: true })
}
