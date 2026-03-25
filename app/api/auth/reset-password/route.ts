import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const limit = rateLimit(ip, 'reset-password', 5, 15 * 60 * 1000)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(limit.resetIn / 1000)) },
    })
  }

  const { token, password } = await req.json()

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.json({ error: 'This link is invalid or has expired.' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
  ])

  return NextResponse.json({ ok: true })
}
