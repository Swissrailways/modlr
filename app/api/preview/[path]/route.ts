import { NextRequest } from 'next/server'
import { isS3Configured, getPreviewUrl, localFileExists, readLocalFile } from '@/lib/fileStorage'
import { verifyPreviewToken } from '@/lib/previewToken'
import { rateLimit } from '@/lib/rateLimit'
import path from 'path'

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png', webp: 'image/webp', gif: 'image/gif',
}

// 20 MB max preview image size
const MAX_PREVIEW_SIZE = 20 * 1024 * 1024

const SECURITY_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'private, no-store',
  'Content-Security-Policy': "default-src 'none'",
  'X-Content-Type-Options': 'nosniff',
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  // Rate limit: 300 preview requests per minute per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = rateLimit(ip, 'preview', 300, 60_000)
  if (!allowed) {
    return new Response('Too Many Requests', { status: 429, headers: { 'Retry-After': '60' } })
  }

  const { path: rawName } = await params

  let storageName: string
  try {
    storageName = decodeURIComponent(rawName)
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  // Only allow simple filenames — no path separators or traversal
  if (!storageName || storageName.includes('..') || storageName.includes('/') || storageName.includes('\\')) {
    return new Response('Forbidden', { status: 403 })
  }

  const ext = path.extname(storageName).slice(1).toLowerCase()
  const mimeType = MIME[ext]
  if (!mimeType) {
    return new Response('Forbidden', { status: 403 })
  }

  // Verify HMAC-signed expiring token (skip in dev if no secret set)
  const isDev = process.env.NODE_ENV === 'development' && !process.env.SESSION_SECRET
  if (!isDev) {
    const exp = req.nextUrl.searchParams.get('exp')
    const sig = req.nextUrl.searchParams.get('sig')
    if (!verifyPreviewToken(storageName, exp, sig)) {
      return new Response('Forbidden', { status: 403, headers: SECURITY_HEADERS })
    }
  }

  // S3 mode: redirect to presigned URL
  if (isS3Configured()) {
    const url = await getPreviewUrl(storageName)
    if (!url) return new Response('Not found', { status: 404 })
    return Response.redirect(url, 302)
  }

  // Local disk mode
  if (!localFileExists(storageName)) {
    return new Response('Not found', { status: 404 })
  }

  const { buffer, size } = readLocalFile(storageName)
  if (size > MAX_PREVIEW_SIZE) {
    return new Response('File too large', { status: 413 })
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      ...SECURITY_HEADERS,
      'Content-Type': mimeType,
      'Content-Length': size.toString(),
    },
  })
}
