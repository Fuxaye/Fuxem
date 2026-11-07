import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { MESSAGES } from '@/lib/constants'
import prisma from '@/lib/prisma'

const memberSelect = {
  id: true,
  username: true,
  displayName: true,
  profile: {
    select: {
      avatarUrl: true,
    },
  },
} as const

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: userId }, { recipientId: userId }],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        requester: { select: memberSelect },
        recipient: { select: memberSelect },
      },
    })

    const friends = friendships.map((friendship) => {
      const member = friendship.requesterId === userId ? friendship.recipient : friendship.requester
      return {
        friendshipId: friendship.id,
        id: member.id,
        username: member.username,
        displayName: member.displayName,
        avatarUrl: member.profile?.avatarUrl || null,
      }
    })

    return NextResponse.json({ friends })
  } catch (error) {
    console.error('Failed to fetch friends:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
