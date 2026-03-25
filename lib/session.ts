import { getIronSession, type IronSession, type SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId?: number
  username?: string
  email?: string
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? 'default-secret-change-in-env-file-now!-32ch',
  cookieName: '3d-market-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
