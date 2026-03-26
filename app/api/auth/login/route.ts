import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  // Rate limit: 10 attempts per IP per 15 minutes
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

  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email, password } = body
  if (!email?.trim() || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!user.emailVerified) {
      return Response.json({ error: 'Please verify your email before logging in.', requiresVerification: true }, { status: 403 })
    }

    const session = await getSession()
    session.userId = user.id
    session.username = user.username
    session.email = user.email
    await session.save()

    return Response.json({ id: user.id, username: user.username, email: user.email })
  } catch (err) {
    console.error('Login error:', err)
    return Response.json({ error: 'Login failed' }, { status: 500 })
  }
}
