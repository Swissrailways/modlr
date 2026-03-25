/**
 * fileStorage.ts — abstraction layer for file storage.
 *
 * In development (no S3 env vars): files are stored on local disk under `uploads/`.
 * In production (S3_BUCKET set): files are stored in an S3-compatible bucket
 *   (AWS S3, Cloudflare R2, Backblaze B2, etc.).
 *
 * Required env vars for S3:
 *   S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
 * Optional:
 *   S3_ENDPOINT   — custom endpoint for R2/B2/MinIO
 *   S3_PUBLIC_URL — public base URL if bucket is public (skips presigning)
 */

import path from 'path'
import fs from 'fs'

// ─── helpers ──────────────────────────────────────────────────────────────────

export function generateStorageKey(originalName: string): string {
  const ext = path.extname(originalName)
  const base = path.basename(originalName, ext)
  const safe = base.replace(/[^a-zA-Z0-9._\-\s]/g, '_').trim().replace(/\s+/g, '_').slice(0, 100)
  const timestamp = Date.now()
  const rand = Math.random().toString(36).slice(2, 8)
  return `${timestamp}_${rand}_${safe}${ext}`
}

function isS3Configured(): boolean {
  return !!(
    process.env.S3_BUCKET &&
    process.env.S3_REGION &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY
  )
}

function getS3Client() {
  const { S3Client } = require('@aws-sdk/client-s3')
  return new S3Client({
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true } : {}),
  })
}

// ─── local disk helpers ───────────────────────────────────────────────────────

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

function localPath(key: string): string {
  const resolved = path.resolve(UPLOAD_DIR, key)
  if (!resolved.startsWith(UPLOAD_DIR + path.sep) && resolved !== UPLOAD_DIR) {
    throw new Error('Invalid file path')
  }
  return resolved
}

// ─── public API ───────────────────────────────────────────────────────────────

/**
 * Upload a file buffer. Returns the storage key to persist in the DB.
 */
export async function uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<void> {
  if (isS3Configured()) {
    const { PutObjectCommand } = require('@aws-sdk/client-s3')
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    )
  } else {
    ensureUploadDir()
    fs.writeFileSync(localPath(key), buffer)
  }
}

/**
 * Upload an image file (preview images, shop logos/banners).
 * Identical to uploadFile — kept separate for clarity.
 */
export async function uploadImage(key: string, buffer: Buffer, mimeType: string): Promise<void> {
  return uploadFile(key, buffer, mimeType)
}

/**
 * Get a temporary presigned download URL (for paid file downloads).
 * Falls back to a local API route when not using S3.
 */
export async function getDownloadUrl(key: string, fileName: string, expiresIn = 3600): Promise<string | null> {
  if (isS3Configured()) {
    const { GetObjectCommand } = require('@aws-sdk/client-s3')
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
    const cmd = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    })
    return getSignedUrl(getS3Client(), cmd, { expiresIn })
  }
  return null // caller falls back to local streaming
}

/**
 * Get a URL for an image preview (public).
 * Returns null if S3 not configured — caller serves from local disk.
 */
export async function getPreviewUrl(key: string): Promise<string | null> {
  if (!isS3Configured()) return null

  // If a public CDN URL is configured, just build the URL directly
  if (process.env.S3_PUBLIC_URL) {
    return `${process.env.S3_PUBLIC_URL.replace(/\/$/, '')}/${key}`
  }

  // Otherwise generate a short-lived presigned URL for the image
  const { GetObjectCommand } = require('@aws-sdk/client-s3')
  const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
  const cmd = new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key })
  return getSignedUrl(getS3Client(), cmd, { expiresIn: 3600 })
}

/**
 * Read a file as a Buffer from local disk (used by local streaming routes).
 * Not called in S3 mode.
 */
export function readLocalFile(key: string): { buffer: Buffer; size: number } {
  const fp = localPath(key)
  const buffer = fs.readFileSync(fp)
  return { buffer, size: buffer.length }
}

/**
 * Check if a local file exists.
 */
export function localFileExists(key: string): boolean {
  try {
    return fs.existsSync(localPath(key))
  } catch {
    return false
  }
}

/**
 * Delete a file (best-effort — errors are logged but not thrown).
 */
export async function deleteFile(key: string): Promise<void> {
  try {
    if (isS3Configured()) {
      const { DeleteObjectCommand } = require('@aws-sdk/client-s3')
      await getS3Client().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }))
    } else {
      const fp = localPath(key)
      if (fs.existsSync(fp)) fs.unlinkSync(fp)
    }
  } catch (err) {
    console.error('deleteFile error for key', key, err)
  }
}

export { isS3Configured }
