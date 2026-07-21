import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { MESSAGES } from '@/lib/constants'
import prisma from '@/lib/prisma'

type ChatroomMessageRow = {
  id: string
  roomId: string
  senderId: string
  senderName: string
  body: string
  createdAt: Date
}

function mapMessage(row: ChatroomMessageRow) {
  return {
    id: row.id,
    roomId: row.roomId,
    senderId: row.senderId,
    senderName: row.senderName,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  const userId = await getAuthenticatedUserId(request)

  if (!userId) {
    return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
  }

  const { roomId } = await context.params

  if (!roomId) {
    return NextResponse.json({ error: 'Room id is required.' }, { status: 400 })
  }

  try {
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: { id: true },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found.' }, { status: 404 })
    }

    const parsedLimit = Number.parseInt(request.nextUrl.searchParams.get('limit') || '50', 10)
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 200) : 50

    const rows = await prisma.$queryRaw<ChatroomMessageRow[]>`
      SELECT "id", "roomId", "senderId", "senderName", "body", "createdAt"
      FROM "ChatRoomMessage"
      WHERE "roomId" = ${roomId}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `

    rows.reverse()

    return NextResponse.json({ messages: rows.map(mapMessage) })
  } catch {
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  const userId = await getAuthenticatedUserId(request)

  if (!userId) {
    return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
  }

  const { roomId } = await context.params

  if (!roomId) {
    return NextResponse.json({ error: 'Room id is required.' }, { status: 400 })
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      body?: unknown
    } | null

    const text = typeof body?.body === 'string' ? body.body.trim() : ''

    if (text.length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 })
    }

    if (text.length > 1000) {
      return NextResponse.json({ error: 'Message is too long.' }, { status: 400 })
    }

    const [room, sender] = await Promise.all([
      prisma.chatRoom.findUnique({
        where: { id: roomId },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          displayName: true,
        },
      }),
    ])

    if (!room) {
      return NextResponse.json({ error: 'Room not found.' }, { status: 404 })
    }

    if (!sender) {
      return NextResponse.json({ error: MESSAGES.LOGIN_INVALID }, { status: 404 })
    }

    const senderName = sender.displayName || `@${sender.username}`
    const id = crypto.randomUUID()

    await prisma.$executeRaw`
      INSERT INTO "ChatRoomMessage" ("id", "roomId", "senderId", "senderName", "body", "createdAt")
      VALUES (${id}, ${roomId}, ${userId}, ${senderName}, ${text}, NOW())
    `

    const [row] = await prisma.$queryRaw<ChatroomMessageRow[]>`
      SELECT "id", "roomId", "senderId", "senderName", "body", "createdAt"
      FROM "ChatRoomMessage"
      WHERE "id" = ${id}
      LIMIT 1
    `

    return NextResponse.json({ message: mapMessage(row) }, { status: 201 })
  } catch {
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
