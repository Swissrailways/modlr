import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { path } = await req.json().catch(() => ({ path: '/' }))

  const cookieStore = await cookies()
  let visitorId = cookieStore.get('vid')?.value

  if (!visitorId) {
    visitorId = crypto.randomUUID()
  }

  await prisma.activeVisitor.upsert({
    where: { id: visitorId },
    update: { path: path ?? '/', lastSeen: new Date() },
    create: { id: visitorId, path: path ?? '/' },
  })

  // Clean up visitors older than 5 minutes
  await prisma.activeVisitor.deleteMany({
    where: { lastSeen: { lt: new Date(Date.now() - 5 * 60 * 1000) } },
  })

  return Response.json({ ok: true }, {
    headers: { 'Set-Cookie': `vid=${visitorId}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax` },
  })
}
