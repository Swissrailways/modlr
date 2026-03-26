import { getSession } from './session'
import { prisma } from './db'

export async function requireAdmin() {
  const session = await getSession()
  if (!session.userId) return null
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, isAdmin: true } })
  if (!user?.isAdmin) return null
  return user
}
