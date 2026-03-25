import { PrismaClient } from '@/app/generated/prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL

  // PostgreSQL (production) — use @prisma/adapter-pg (required by Prisma 7 prisma-client generator)
  if (url && (url.startsWith('postgres://') || url.startsWith('postgresql://'))) {
    const { Pool } = require('pg')
    const { PrismaPg } = require('@prisma/adapter-pg')
    const pool = new Pool({ connectionString: url })
    return new PrismaClient({ adapter: new PrismaPg(pool) })
  }

  // SQLite (local dev) — use better-sqlite3 driver adapter
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
  const dbPath = url?.startsWith('file:')
    ? path.resolve(process.cwd(), url.replace(/^file:/, ''))
    : path.join(process.cwd(), 'dev.db')
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbPath }) })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
