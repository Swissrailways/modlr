import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

const USERNAME_REGEX = /^[a-z0-9_]{3,24}$/
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: { username?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const username = body.username?.trim().toLowerCase()
  if (!username || !USERNAME_REGEX.test(username)) {
    return Response.json(
      { error: 'Username must be 3–24 characters: letters, numbers, underscores only.' },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  // Enforce 30-day cooldown (skip on initial username setup where usernameChangedAt is null)
  if (user.usernameChangedAt) {
    const elapsed = Date.now() - user.usernameChangedAt.getTime()
    if (elapsed < COOLDOWN_MS) {
      const daysLeft = Math.ceil((COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000))
      return Response.json(
        { error: `You can change your username again in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.` },
        { status: 429 }
      )
    }
  }

  if (username === user.username.toLowerCase()) {
    return Response.json({ error: 'That is already your username.' }, { status: 400 })
  }

  const taken = await prisma.user.findFirst({ where: { username, NOT: { id: session.userId } } })
  if (taken) {
    return Response.json({ error: 'Username is already taken.' }, { status: 409 })
  }

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: { username, usernameChangedAt: new Date() },
  })

  session.username = updated.username
  await session.save()

  return Response.json({ ok: true, username: updated.username })
}
