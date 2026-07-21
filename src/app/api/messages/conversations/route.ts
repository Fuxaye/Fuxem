import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { MESSAGES } from '@/lib/constants'
import prisma from '@/lib/prisma'

type MessageRow = {
  id: string
  senderId: string
  recipientId: string
  kind: string
  body: string
  readAt: Date | null
  createdAt: Date
}

type PartnerProfile = {
  avatarUrl: string | null
  showOnlineStatus: boolean
}

type PartnerRow = {
  id: string
  username: string
  displayName: string
  updatedAt: Date
  profile: PartnerProfile | null
}

function mapMessage(message: MessageRow) {
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

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const recentMessages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 500,
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

    if (recentMessages.length === 0) {
      return NextResponse.json({ conversations: [] }, { status: 200 })
    }

    const partnerIdSet = new Set<string>()
    for (const message of recentMessages) {
      const partnerId = message.senderId === userId ? message.recipientId : message.senderId
      partnerIdSet.add(partnerId)
    }

    const partnerIds = Array.from(partnerIdSet)

    const blockedLinks = await prisma.friendship.findMany({
      where: {
        status: 'blocked',
        OR: [
          {
            requesterId: userId,
            recipientId: {
              in: partnerIds,
            },
          },
          {
            recipientId: userId,
            requesterId: {
              in: partnerIds,
            },
          },
        ],
      },
      select: {
        requesterId: true,
        recipientId: true,
      },
    })

    const blockedPartnerIds = new Set<string>()
    for (const row of blockedLinks) {
      blockedPartnerIds.add(row.requesterId === userId ? row.recipientId : row.requesterId)
    }

    const [partners, unreadCounts] = await Promise.all([
      prisma.user.findMany({
        where: {
          id: {
            in: partnerIds.filter((partnerId) => !blockedPartnerIds.has(partnerId)),
          },
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          updatedAt: true,
          profile: {
            select: {
              avatarUrl: true,
              showOnlineStatus: true,
            },
          },
        },
      }),
      prisma.message.groupBy({
        by: ['senderId'],
        where: {
          recipientId: userId,
          readAt: null,
        },
        _count: {
          _all: true,
        },
      }),
    ])

    const partnerById = new Map<string, PartnerRow>(partners.map((partner) => [partner.id, partner]))
    const unreadByPartner = new Map<string, number>(
      unreadCounts.map((row) => [row.senderId, row._count._all])
    )

    const latestMessageByPartner = new Map<string, MessageRow>()
    for (const message of recentMessages) {
      const partnerId = message.senderId === userId ? message.recipientId : message.senderId
      if (!latestMessageByPartner.has(partnerId)) {
        latestMessageByPartner.set(partnerId, message)
      }
    }

    const conversations = Array.from(latestMessageByPartner.entries())
      .map(([partnerId, lastMessage]) => {
        const partner = partnerById.get(partnerId)
        if (!partner) {
          return null
        }

        return {
          partnerId,
          partnerUsername: partner.username,
          partnerDisplayName: partner.displayName,
          partnerAvatarUrl: partner.profile?.avatarUrl || null,
          partnerLastActiveAt: partner.profile?.showOnlineStatus ? partner.updatedAt.toISOString() : null,
          lastMessage: mapMessage(lastMessage),
          unreadCount: unreadByPartner.get(partnerId) || 0,
        }
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => {
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
      })

    return NextResponse.json({ conversations }, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch conversations:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}