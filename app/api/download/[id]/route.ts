import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { isS3Configured, getDownloadUrl, localFileExists, readLocalFile } from '@/lib/fileStorage'
import { rateLimit } from '@/lib/rateLimit'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 20 downloads per hour per user
  const { allowed } = rateLimit(String(user.id), 'download', 20, 60 * 60_000)
  if (!allowed) {
    return Response.json({ error: 'Too many downloads. Try again later.' }, { status: 429 })
  }

  try {
    const { id } = await params
    const productId = parseInt(id)
    if (isNaN(productId) || productId <= 0) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product || !product.published) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    // Check access: free products are open, paid require purchase
    if (product.price > 0) {
      const purchase = await prisma.purchase.findUnique({
        where: { userId_productId: { userId: user.id, productId } },
      })
      if (!purchase) return Response.json({ error: 'Purchase required' }, { status: 403 })
    }

    // S3 mode: redirect to a presigned download URL
    if (isS3Configured()) {
      const url = await getDownloadUrl(product.filePath, product.fileName)
      if (!url) return Response.json({ error: 'File not available' }, { status: 404 })
      return Response.redirect(url, 302)
    }

    // Local disk mode: stream the file
    if (!localFileExists(product.filePath)) {
      return Response.json({ error: 'File not found on disk' }, { status: 404 })
    }

    const { buffer, size } = readLocalFile(product.filePath)

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': product.mimeType,
        'Content-Length': size.toString(),
        'Content-Disposition': `attachment; filename="download"; filename*=UTF-8''${encodeURIComponent(product.fileName)}`,
      },
    })
  } catch (err) {
    console.error('GET /api/download/[id] error:', err)
    return Response.json({ error: 'Download failed' }, { status: 500 })
  }
}
