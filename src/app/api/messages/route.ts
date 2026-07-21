import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { MESSAGES } from '@/lib/constants'
import prisma from '@/lib/prisma'
import type { MessageKind } from '@/lib/types'

const ALLOWED_KINDS: MessageKind[] = ['text', 'poke', 'wink', 'wave']

function isAllowedKind(value: unknown): value is MessageKind {
  return typeof value === 'string' && ALLOWED_KINDS.includes(value as MessageKind)
}

function mapDirectMessage(message: {
  id: string
  senderId: string
  recipientId: string
  kind: string
  body: string
  readAt: Date | null
  createdAt: Date
}) {
  return {
    id: message.id,
    senderId: message.senderId,
    recipientId: message.recipientId,
    kind: message.kind,
    body: message.body,
    readAt: message.readAt ? message.readAt.toISOString() : null,
    createdAt: message.createdAt.toISOString(),
  }
}

async function getFriendshipContext(userId: string, partnerId: string) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId, recipientId: partnerId },
        { requesterId: partnerId, recipientId: userId },
      ],
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      status: true,
      requesterId: true,
      recipientId: true,
    },
  })

  if (!friendship || friendship.status !== 'pending') {
    return null
  }

  return {
    id: friendship.id,
    direction: friendship.requesterId === userId ? 'sent' : 'received',
    intro: null,
  } as const
}

async function hasBlockRelationship(userId: string, partnerId: string) {
  const block = await prisma.friendship.findFirst({
    where: {
      status: 'blocked',
      OR: [
        { requesterId: userId, recipientId: partnerId },
        { requesterId: partnerId, recipientId: userId },
      ],
    },
    select: { id: true },
  })

  return Boolean(block)
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const partnerId = request.nextUrl.searchParams.get('with')?.trim()

    if (!partnerId) {
      return NextResponse.json({ error: MESSAGES.FIELD_REQUIRED }, { status: 400 })
    }

    if (partnerId === userId) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_SELF }, { status: 400 })
    }

    const blocked = await hasBlockRelationship(userId, partnerId)
    if (blocked) {
      return NextResponse.json({ error: 'Conversation unavailable' }, { status: 403 })
    }

    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        username: true,
        displayName: true,
        updatedAt: true,
        profile: {
          select: {
            avatarUrl: true,
            allowDirectMessages: true,
            showOnlineStatus: true,
          },
        },
      },
    })

    if (!partner) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_INVALID_TARGET }, { status: 404 })
    }

    const canMessage = partner.profile?.allowDirectMessages !== false

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: partnerId },
          { senderId: partnerId, recipientId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 250,
      select: {
        id: true,
        senderId: true,
        recipientId: true,
        kind: true,
        body: true,
        readAt: true,
        createdAt: true,
      },
    })

    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        recipientId: userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    })

    const pendingRequest = await getFriendshipContext(userId, partnerId)

    return NextResponse.json(
      {
        canMessage,
        pendingRequest,
        messages: messages.map(mapDirectMessage),
        partner: {
          id: partner.id,
          username: partner.username,
          displayName: partner.displayName,
          avatarUrl: partner.profile?.avatarUrl || null,
          lastActiveAt: partner.profile?.showOnlineStatus ? partner.updatedAt.toISOString() : null,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to fetch direct messages:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const body = (await request.json().catch(() => null)) as {
      recipientId?: unknown
      body?: unknown
      kind?: unknown
    } | null

    if (!body || typeof body.recipientId !== 'string' || body.recipientId.trim().length === 0) {
      return NextResponse.json({ error: MESSAGES.FIELD_REQUIRED }, { status: 400 })
    }

    const recipientId = body.recipientId.trim()

    if (recipientId === userId) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_SELF }, { status: 400 })
    }

    const blocked = await hasBlockRelationship(userId, recipientId)
    if (blocked) {
      return NextResponse.json({ error: 'You cannot message this member' }, { status: 403 })
    }

    const kind: MessageKind = isAllowedKind(body.kind)
      ? body.kind
      : 'text'

    const textBody = typeof body.body === 'string' ? body.body.trim() : ''

    if (kind === 'text' && textBody.length === 0) {
      return NextResponse.json({ error: MESSAGES.FIELD_REQUIRED }, { status: 400 })
    }

    if (textBody.length > 4000) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        id: true,
        profile: {
          select: {
            allowDirectMessages: true,
          },
        },
      },
    })

    if (!recipient) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_INVALID_TARGET }, { status: 404 })
    }

    if (recipient.profile?.allowDirectMessages === false) {
      return NextResponse.json({ error: MESSAGES.DIRECT_MESSAGES_DISABLED }, { status: 403 })
    }

    const created = await prisma.message.create({
      data: {
        senderId: userId,
        recipientId,
        kind,
        body: kind === 'text' ? textBody : '',
      },
      select: {
        id: true,
        senderId: true,
        recipientId: true,
        kind: true,
        body: true,
        readAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ message: mapDirectMessage(created) }, { status: 201 })
  } catch (error) {
    console.error('Failed to send direct message:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}