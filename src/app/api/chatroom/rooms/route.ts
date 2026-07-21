import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { MESSAGES } from '@/lib/constants'
import prisma from '@/lib/prisma'

const ALLOWED_ROOM_TYPES = new Set(['public', 'group', 'private'])

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request)

  if (!userId) {
    return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
  }

  try {
    const rooms = await prisma.chatRoom.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      rooms: rooms.map((room) => ({
        ...room,
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString(),
      })),
    })
  } catch {
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request)

  if (!userId) {
    return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      name?: unknown
      type?: unknown
    } | null

    const rawName = typeof body?.name === 'string' ? body.name.trim() : ''
    const rawType = typeof body?.type === 'string' ? body.type.trim().toLowerCase() : 'public'

    if (rawName.length < 2 || rawName.length > 60) {
      return NextResponse.json({ error: 'Room name must be 2-60 characters.' }, { status: 400 })
    }

    if (!ALLOWED_ROOM_TYPES.has(rawType)) {
      return NextResponse.json({ error: 'Invalid room type.' }, { status: 400 })
    }

    const room = await prisma.chatRoom.create({
      data: {
        name: rawName,
        type: rawType,
      },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(
      {
        room: {
          ...room,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
