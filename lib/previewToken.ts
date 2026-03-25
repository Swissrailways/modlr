import crypto from 'crypto'

const SECRET = process.env.SESSION_SECRET ?? 'dev-secret-change-me'
// Preview tokens expire in 2 hours
const TTL_MS = 2 * 60 * 60 * 1000

function hmac(data: string): string {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
}

export function signPreviewPath(storageName: string): string {
  const exp = (Date.now() + TTL_MS).toString()
  const sig = hmac(`${storageName}|${exp}`)
  return `/api/preview/${encodeURIComponent(storageName)}?exp=${exp}&sig=${encodeURIComponent(sig)}`
}

export function verifyPreviewToken(
  storageName: string,
  exp: string | null,
  sig: string | null,
): boolean {
  if (!exp || !sig) return false
  const expMs = parseInt(exp, 10)
  if (isNaN(expMs) || Date.now() > expMs) return false
  const expected = hmac(`${storageName}|${exp}`)
  try {
    const a = Buffer.from(expected, 'base64url')
    const b = Buffer.from(decodeURIComponent(sig), 'base64url')
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}
