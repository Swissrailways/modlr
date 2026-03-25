import { getSession } from '@/lib/session'

export async function DELETE() {
  const session = await getSession()
  session.destroy()
  return Response.json({ ok: true })
}
