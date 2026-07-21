import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { MESSAGES } from '@/lib/constants'
import prisma from '@/lib/prisma'

function toFriendshipResponse(friendship: {
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

export async function POST(request: NextRequest) {
  try {
    const requesterId = await getAuthenticatedUserId(request)

    if (!requesterId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const body = (await request.json().catch(() => null)) as {
      recipientId?: unknown
    } | null

    if (!body || typeof body.recipientId !== 'string' || body.recipientId.trim().length === 0) {
      return NextResponse.json({ error: MESSAGES.FIELD_REQUIRED }, { status: 400 })
    }

    const recipientId = body.recipientId.trim()

    if (recipientId === requesterId) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_SELF }, { status: 400 })
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        id: true,
        profile: {
          select: {
            allowFriendRequests: true,
          },
        },
      },
    })

    if (!recipient) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_INVALID_TARGET }, { status: 404 })
    }

    if (recipient.profile?.allowFriendRequests === false) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUESTS_DISABLED }, { status: 403 })
    }

    const existing = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId, recipientId },
          { requesterId: recipientId, recipientId: requesterId },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        requesterId: true,
        recipientId: true,
        status: true,
        createdAt: true,
      },
    })

    const accepted = existing.find((row) => row.status === 'accepted')
    if (accepted) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_ALREADY_FRIENDS }, { status: 400 })
    }

    const blocked = existing.find((row) => row.status === 'blocked')
    if (blocked) {
      if (blocked.requesterId === requesterId) {
        return NextResponse.json({ error: 'You have blocked this member. Unblock first.' }, { status: 403 })
      }

      return NextResponse.json({ error: 'This member is not accepting requests from you.' }, { status: 403 })
    }

    const pending = existing.find((row) => row.status === 'pending')
    if (pending) {
      if (pending.requesterId === requesterId) {
        return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_ALREADY_SENT }, { status: 400 })
      }

      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_RECEIVED_PENDING }, { status: 400 })
    }

    const reusableDeclined = existing.find((row) => row.status === 'declined')

    const friendship = reusableDeclined
      ? await prisma.friendship.update({
          where: { id: reusableDeclined.id },
          data: {
            requesterId,
            recipientId,
            status: 'pending',
          },
          select: {
            id: true,
            requesterId: true,
            recipientId: true,
            status: true,
            createdAt: true,
          },
        })
      : await prisma.friendship.create({
          data: {
            requesterId,
            recipientId,
            status: 'pending',
          },
          select: {
            id: true,
            requesterId: true,
            recipientId: true,
            status: true,
            createdAt: true,
          },
        })

    return NextResponse.json(toFriendshipResponse(friendship), { status: 201 })
  } catch (error) {
    console.error('Failed to create friend request:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}