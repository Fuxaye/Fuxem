import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { MESSAGES } from '@/lib/constants'
import prisma from '@/lib/prisma'
import type { FriendshipDecisionAction } from '@/lib/types'

const ALLOWED_ACTIONS: FriendshipDecisionAction[] = ['accept', 'decline', 'cancel']

function isAllowedAction(value: unknown): value is FriendshipDecisionAction {
  return typeof value === 'string' && ALLOWED_ACTIONS.includes(value as FriendshipDecisionAction)
}

function mapPendingRequest(friendship: {
  id: string
  createdAt: Date
  requester: {
    id: string
    username: string
    displayName: string
    profile: {
      avatarUrl: string | null
    } | null
  }
  recipient: {
    id: string
    username: string
    displayName: string
    profile: {
      avatarUrl: string | null
    } | null
  }
}, direction: 'incoming' | 'outgoing') {
  const member = direction === 'incoming' ? friendship.requester : friendship.recipient

  return {
    id: friendship.id,
    createdAt: friendship.createdAt.toISOString(),
    status: 'pending' as const,
    direction,
    member: {
      id: member.id,
      username: member.username,
      displayName: member.displayName,
      avatarUrl: member.profile?.avatarUrl || null,
    },
  }
}

function mapFriendship(friendship: {
  id: string
  requesterId: string
  recipientId: string
  status: string
  createdAt: Date
}) {
  return {
    friendship: {
      id: friendship.id,
      requesterId: friendship.requesterId,
      recipientId: friendship.recipientId,
      status: friendship.status,
      createdAt: friendship.createdAt.toISOString(),
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const [incoming, outgoing] = await Promise.all([
      prisma.friendship.findMany({
        where: {
          recipientId: userId,
          status: 'pending',
        },
        orderBy: { createdAt: 'desc' },
        include: {
          requester: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
          recipient: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
      prisma.friendship.findMany({
        where: {
          requesterId: userId,
          status: 'pending',
        },
        orderBy: { createdAt: 'desc' },
        include: {
          requester: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
          recipient: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
    ])

    return NextResponse.json(
      {
        incoming: incoming.map((row) => mapPendingRequest(row, 'incoming')),
        outgoing: outgoing.map((row) => mapPendingRequest(row, 'outgoing')),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to fetch friend requests:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const body = (await request.json().catch(() => null)) as {
      friendshipId?: unknown
      action?: unknown
    } | null

    if (!body || typeof body.friendshipId !== 'string' || body.friendshipId.trim().length === 0) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_NOT_FOUND }, { status: 400 })
    }

    if (!isAllowedAction(body.action)) {
      return NextResponse.json({ error: MESSAGES.FIELD_REQUIRED }, { status: 400 })
    }

    const friendshipId = body.friendshipId.trim()
    const action = body.action

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      select: {
        id: true,
        requesterId: true,
        recipientId: true,
        status: true,
        createdAt: true,
      },
    })

    if (!friendship) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_NOT_FOUND }, { status: 404 })
    }

    if (friendship.status !== 'pending') {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_NOT_PENDING }, { status: 400 })
    }

    if (action === 'accept') {
      if (friendship.recipientId !== userId) {
        return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_NO_PERMISSION }, { status: 403 })
      }

      const updated = await prisma.friendship.update({
        where: { id: friendship.id },
        data: { status: 'accepted' },
        select: {
          id: true,
          requesterId: true,
          recipientId: true,
          status: true,
          createdAt: true,
        },
      })

      return NextResponse.json(mapFriendship(updated), { status: 200 })
    }

    if (action === 'decline') {
      if (friendship.recipientId !== userId) {
        return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_NO_PERMISSION }, { status: 403 })
      }

      const updated = await prisma.friendship.update({
        where: { id: friendship.id },
        data: { status: 'declined' },
        select: {
          id: true,
          requesterId: true,
          recipientId: true,
          status: true,
          createdAt: true,
        },
      })

      return NextResponse.json(mapFriendship(updated), { status: 200 })
    }

    if (friendship.requesterId !== userId) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_NO_PERMISSION }, { status: 403 })
    }

    const updated = await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: 'declined' },
      select: {
        id: true,
        requesterId: true,
        recipientId: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json(mapFriendship(updated), { status: 200 })
  } catch (error) {
    console.error('Failed to update friend request:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}