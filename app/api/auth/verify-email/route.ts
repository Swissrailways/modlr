import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/verify-email?error=missing', request.url))
  }

  try {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!record || record.used || record.expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid', request.url))
    }

    await prisma.$transaction([
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
    ])

    const session = await getSession()
    session.userId = record.user.id
    session.username = record.user.username
    session.email = record.user.email ?? ''
    await session.save()

    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (err) {
    console.error('Verify email error:', err)
    return NextResponse.redirect(new URL('/verify-email?error=server', request.url))
  }
}
