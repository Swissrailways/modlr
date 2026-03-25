// Simple in-memory rate limiter — works for single-instance local server
// Tracks attempts per IP with a sliding window

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000)

export function rateLimit(
  ip: string,
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const storeKey = `${key}:${ip}`
  const now = Date.now()
  const entry = store.get(storeKey)

  if (!entry || entry.resetAt < now) {
    store.set(storeKey, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1, resetIn: windowMs }
  }

  entry.count++
  const resetIn = entry.resetAt - now

  if (entry.count > maxAttempts) {
    return { allowed: false, remaining: 0, resetIn }
  }

  return { allowed: true, remaining: maxAttempts - entry.count, resetIn }
}
