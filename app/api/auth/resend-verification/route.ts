import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'
  const limit = rateLimit(ip, 'resend-verification', 3, 15 * 60 * 1000)
  if (!limit.allowed) {
    return Response.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 })
  }

  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email } = body
  if (!email?.trim()) {
    return Response.json({ error: 'Email is required' }, { status: 400 })
  }

  // Always return success to prevent email enumeration
  try {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (user && !user.emailVerified) {
      const token = crypto.randomBytes(32).toString('hex')
      await prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${request.headers.get('host')}`
      const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`
      await sendVerificationEmail(user.email, verifyUrl)
    }
  } catch (err) {
    console.error('Resend verification error:', err)
  }

  return Response.json({ success: true })
}
