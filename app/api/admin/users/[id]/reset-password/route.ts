import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/db'
import { sendDiscordDM } from '@/lib/discord'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const userId = parseInt(id)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  if (!user.discordId && !user.email) {
    return Response.json({ error: 'User has no Discord or email to send reset to' }, { status: 400 })
  }

  // Invalidate existing tokens
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  })

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  let sent = false
  if (user.discordId) {
    sent = await sendDiscordDM(
      user.discordId,
      `🔐 **Modlr Password Reset**\n\nAn admin has triggered a password reset for your account.\n\nClick the link below to set a new password. This link expires in **1 hour**.\n\n${resetUrl}\n\nIf you didn't expect this, please contact support.`
    )
  } else if (user.email) {
    sent = await sendPasswordResetEmail(user.email, resetUrl)
  }

  if (!sent) {
    return Response.json({ error: 'Failed to send reset message' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
