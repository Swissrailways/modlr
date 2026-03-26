import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  // Rate limit: 5 registrations per IP per hour
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'
  const limit = rateLimit(ip, 'register', 5, 60 * 60 * 1000)
  if (!limit.allowed) {
    return Response.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429 }
    )
  }

  let body: { username?: string; email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { username, email, password } = body
  if (!username?.trim() || !email?.trim() || !password) {
    return Response.json({ error: 'Username, email and password are required' }, { status: 400 })
  }
  if (password.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
    return Response.json({ error: 'Username can only contain letters, numbers and underscores' }, { status: 400 })
  }

  try {
    const cleanEmail = email.trim().toLowerCase()
    const cleanUsername = username.trim().toLowerCase()

    // Check for existing account by email
    const existingByEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { emailVerificationTokens: { orderBy: { createdAt: 'desc' }, take: 1 } },
    })

    if (existingByEmail) {
      if (!existingByEmail.emailVerified) {
        const latestToken = existingByEmail.emailVerificationTokens[0]
        const tokenExpired = !latestToken || latestToken.expiresAt < new Date()

        if (tokenExpired) {
          // Ghost account — verification window passed, delete and allow re-registration
          await prisma.user.delete({ where: { id: existingByEmail.id } })
        } else {
          // Unverified but token still valid — resend the email
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${request.headers.get('host')}`
          const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${latestToken.token}`
          sendVerificationEmail(cleanEmail, verifyUrl).catch(err => console.error('Failed to send verification email:', err))
          return Response.json({ requiresVerification: true, email: cleanEmail }, { status: 200 })
        }
      } else {
        return Response.json({ error: 'An account with this email already exists' }, { status: 409 })
      }
    }

    // Check username separately — clean up ghost accounts (unverified + expired token)
    const existingByUsername = await prisma.user.findUnique({
      where: { username: cleanUsername },
      include: { emailVerificationTokens: { orderBy: { createdAt: 'desc' }, take: 1 } },
    })
    if (existingByUsername) {
      if (!existingByUsername.emailVerified) {
        const latestToken = existingByUsername.emailVerificationTokens[0]
        const tokenExpired = !latestToken || latestToken.expiresAt < new Date()
        if (tokenExpired) {
          // Ghost account — delete and free up the username
          await prisma.user.delete({ where: { id: existingByUsername.id } })
        } else {
          return Response.json({ error: 'This username is already taken' }, { status: 409 })
        }
      } else {
        return Response.json({ error: 'This username is already taken' }, { status: 409 })
      }
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email: cleanEmail, username: cleanUsername, password: hashed },
    })

    // Create verification token (24 hour expiry)
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
    sendVerificationEmail(user.email, verifyUrl).catch(err => console.error('Failed to send verification email:', err))

    return Response.json({ requiresVerification: true, email: user.email }, { status: 201 })
  } catch (err) {
    console.error('Register error:', err)
    return Response.json({ error: 'Registration failed' }, { status: 500 })
  }
}
