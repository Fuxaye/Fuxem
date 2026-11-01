import { PrismaClient } from '@prisma/client'

// In development, hot-module reloads would otherwise leak a new PrismaClient
// instance on every reload. The globalThis singleton prevents that.
// In production there is one process and one long-lived client.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function getDatasourceUrl(): string | undefined {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) return undefined

  const url = new URL(databaseUrl)
  if (!url.searchParams.has('connect_timeout')) {
    url.searchParams.set('connect_timeout', '15')
  }

  return url.toString()
}

const datasourceUrl = getDatasourceUrl()
const prisma = globalForPrisma.prisma ?? (
  datasourceUrl ? new PrismaClient({ datasourceUrl }) : new PrismaClient()
)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
