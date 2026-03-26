import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const full = await prisma.user.findUnique({ where: { id: user.id }, select: { password: true } })
  return Response.json({ ...user, hasPassword: !!full?.password })
}
