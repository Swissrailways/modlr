import path from 'path'
import fs from 'fs'

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

export function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

export function getFilePath(filename: string): string {
  const resolved = path.resolve(UPLOAD_DIR, filename)
  // Prevent path traversal — ensure the resolved path stays inside UPLOAD_DIR
  if (!resolved.startsWith(UPLOAD_DIR + path.sep) && resolved !== UPLOAD_DIR) {
    throw new Error('Invalid file path')
  }
  return resolved
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._\-\s]/g, '_').trim()
}

export function generateStorageName(originalName: string): string {
  const ext = path.extname(originalName)
  const base = path.basename(originalName, ext)
  const safe = sanitizeFilename(base).replace(/\s+/g, '_').slice(0, 100)
  const timestamp = Date.now()
  const rand = Math.random().toString(36).slice(2, 8)
  return `${timestamp}_${rand}_${safe}${ext}`
}
