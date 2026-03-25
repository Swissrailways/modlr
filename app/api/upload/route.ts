import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateStorageKey, uploadFile } from '@/lib/fileStorage'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const shop = await prisma.shop.findUnique({ where: { userId: user.id } })
  if (!shop) return Response.json({ error: 'You must create a shop first' }, { status: 403 })

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.includes('multipart/form-data')) {
    return Response.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const formData = await request.formData()
  const fileEntry = formData.get('file') as File | null
  if (!fileEntry) return Response.json({ error: 'No file provided' }, { status: 400 })

  const MAX_SIZE = 10 * 1024 * 1024 * 1024
  if (fileEntry.size > MAX_SIZE) {
    return Response.json({ error: 'File exceeds 10 GB limit' }, { status: 413 })
  }

  // Whitelist allowed 3D model file extensions
  const ALLOWED_EXTENSIONS = new Set([
    '.stl', '.obj', '.fbx', '.blend', '.glb', '.gltf',
    '.3mf', '.ply', '.step', '.stp', '.iges', '.igs',
    '.dxf', '.amf', '.zip', '.7z', '.rar',
  ])
  const ext = fileEntry.name.includes('.') ? '.' + fileEntry.name.split('.').pop()!.toLowerCase() : ''
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return Response.json({ error: `File type "${ext || 'unknown'}" is not allowed. Supported: STL, OBJ, FBX, BLEND, GLB, GLTF, 3MF, PLY, STEP, IGES, ZIP` }, { status: 415 })
  }

  const key = generateStorageKey(fileEntry.name)

  try {
    const buffer = Buffer.from(await fileEntry.arrayBuffer())
    await uploadFile(key, buffer, fileEntry.type || 'application/octet-stream')
  } catch (err) {
    console.error('Upload error:', err)
    return Response.json({ error: 'Failed to save file' }, { status: 500 })
  }

  return Response.json({
    filePath: key,
    fileName: fileEntry.name,
    fileSize: fileEntry.size,
    mimeType: fileEntry.type || 'application/octet-stream',
  })
}
