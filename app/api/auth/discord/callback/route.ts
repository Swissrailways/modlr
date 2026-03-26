import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { exchangeDiscordCode, getDiscordUser, sendDiscordDM } from '@/lib/discord'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${request.headers.get('host')}`
  const redirectUri = `${baseUrl}/api/auth/discord/callback`

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state') ?? ''

  if (error || !code) {
    return Response.redirect(`${baseUrl}/login?error=discord_cancelled`)
  }

  try {
    const tokens = await exchangeDiscordCode(code, redirectUri)
    const discordUser = await getDiscordUser(tokens.access_token)

    // Password reset via Discord flow
    if (state === 'password_reset') {
      const user = await prisma.user.findFirst({ where: { discordId: discordUser.id } })
      if (!user) {
        return Response.redirect(`${baseUrl}/forgot-password?discord=not_found`)
      }
      // Invalidate existing tokens
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
      })
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
      await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      })
      const resetUrl = `${baseUrl}/reset-password?token=${token}`
      await sendDiscordDM(
        discordUser.id,
        `🔐 **Modlr Password Reset**\n\nClick the link below to reset your password. This link expires in **1 hour**.\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this message.`
      )
      return Response.redirect(`${baseUrl}/forgot-password?discord=sent`)
    }

    // Build avatar URL
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null

    // Determine username — use global_name or username, ensure uniqueness
    const baseUsername = (discordUser.global_name ?? discordUser.username)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .slice(0, 20)

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { discordId: discordUser.id },
          ...(discordUser.email ? [{ email: discordUser.email }] : []),
        ],
      },
    })

    let isNewUser = false

    if (user) {
      // Update Discord info on existing account
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          discordId: discordUser.id,
          discordUsername: discordUser.username,
          discordAvatar: avatarUrl,
          emailVerified: true,
        },
      })
    } else {
      isNewUser = true
      // Create new account with temp username — user will choose one on /choose-username
      let username = baseUsername
      let suffix = 0
      while (await prisma.user.findUnique({ where: { username } })) {
        suffix++
        username = `${baseUsername}${suffix}`
      }

      user = await prisma.user.create({
        data: {
          email: discordUser.email ?? null,
          username,
          password: null,
          emailVerified: true,
          discordId: discordUser.id,
          discordUsername: discordUser.username,
          discordAvatar: avatarUrl,
        },
      })
    }

    // Create session
    const session = await getSession()
    session.userId = user.id
    session.username = user.username
    session.email = user.email ?? ''
    await session.save()

    // New users pick their username before continuing
    return Response.redirect(isNewUser ? `${baseUrl}/choose-username` : `${baseUrl}/`)
  } catch (err) {
    console.error('[Discord OAuth] Error:', err)
    return Response.redirect(`${baseUrl}/login?error=discord_failed`)
  }
}
