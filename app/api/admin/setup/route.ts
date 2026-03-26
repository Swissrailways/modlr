import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

// One-time endpoint: promotes the logged-in user to admin if no admins exist yet
export async function POST() {
  const session = await getSession()
  if (!session.userId) return Response.json({ error: 'Not logged in' }, { status: 401 })

  const existingAdmin = await prisma.user.findFirst({ where: { isAdmin: true } })
  if (existingAdmin) return Response.json({ error: 'Admin already exists' }, { status: 403 })

  await prisma.user.update({ where: { id: session.userId }, data: { isAdmin: true } })
  return Response.json({ success: true })
}
