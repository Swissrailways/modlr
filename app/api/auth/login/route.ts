import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'
  const limit = rateLimit(ip, 'login', 10, 15 * 60 * 1000)
  if (!limit.allowed) {
    return Response.json(
      { error: 'Too many login attempts. Please wait before trying again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.resetIn / 1000)) } }
    )
  }

  let body: { username?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { username, password } = body
  if (!username?.trim() || !password) {
    return Response.json({ error: 'Username and password are required' }, { status: 400 })
  }

  try {
    // Look up by username or email
    const identifier = username.trim().toLowerCase()
    const user = await prisma.user.findFirst({
      where: { OR: [{ username: identifier }, { email: identifier }] },
    })

    if (!user) {
      return Response.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    if (!user.password) {
      return Response.json({ error: 'This account uses Discord login. Please sign in with Discord.' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return Response.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const session = await getSession()
    session.userId = user.id
    session.username = user.username
    session.email = user.email ?? ''
    await session.save()

    return Response.json({ id: user.id, username: user.username, email: user.email })
  } catch (err) {
    console.error('Login error:', err)
    return Response.json({ error: 'Login failed' }, { status: 500 })
  }
}
