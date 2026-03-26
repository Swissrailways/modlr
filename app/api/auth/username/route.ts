import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

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

  if (!username) {
    return Response.json({ error: 'Username is required' }, { status: 400 })
  }
  if (username.length < 3 || username.length > 24) {
    return Response.json({ error: 'Username must be 3–24 characters' }, { status: 400 })
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return Response.json({ error: 'Only letters, numbers and underscores allowed' }, { status: 400 })
  }

  const taken = await prisma.user.findFirst({
    where: { username, NOT: { id: session.userId } },
  })
  if (taken) {
    return Response.json({ error: 'Username already taken' }, { status: 409 })
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { username },
  })

  session.username = username
  await session.save()

  return Response.json({ ok: true })
}
