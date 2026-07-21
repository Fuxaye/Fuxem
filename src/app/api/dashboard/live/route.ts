import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

import { AUTH_COOKIE_NAME, MESSAGES } from '@/lib/constants'
import prisma from '@/lib/prisma'
import type { AuthTokenPayload } from '@/lib/types'

export const dynamic = 'force-dynamic'

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000

type DashboardLivePayload = {
  stats: {
    profileViews: number
    connections: number
    messagesReceived: number
    engagementPercent: number
  }
  modelStats: {
    totalVideos: number
    publicVideos: number
    unreadMessages: number
    pendingReports: number
  }
  recentActivity: Array<{
    id: string
    action: string
    time: string
  }>
  generatedAt: string
}

function formatRelativeTime(timestamp: Date): string {
  const diffMs = Date.now() - timestamp.getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)))

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`
  }

  const diffYears = Math.floor(diffMonths / 12)
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`
}

function getBearerToken(header: string | null): string | null {
  if (!header) {
    return null
  }

  const [scheme, token] = header.split(' ')

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null
  }

  return token
}

function getUserIdFromToken(token: string): string | null {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    return null
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as AuthTokenPayload & { sub?: string }

    if (payload.mode === 'default-member') {
      return null
    }

    if (typeof payload.userId === 'string' && payload.userId) {
      return payload.userId
    }

    return typeof payload.sub === 'string' && payload.sub ? payload.sub : null
  } catch {
    return null
  }
}

async function loadDashboardLivePayload(userId: string): Promise<DashboardLivePayload> {
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_IN_MS)

  const [
    connectionsCount,
    messagesReceivedCount,
    totalReceivedMessagesCount,
    readReceivedMessagesCount,
    profileViewsAggregate,
    recentMessages,
    recentFriendships,
    totalVideosCount,
    publicVideosCount,
    unreadMessagesCount,
    pendingReportsCount,
    profile,
  ] = await Promise.all([
    prisma.friendship.count({
      where: {
        status: 'accepted',
        OR: [{ requesterId: userId }, { recipientId: userId }],
      },
    }),
    prisma.message.count({
      where: {
        recipientId: userId,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.message.count({
      where: { recipientId: userId },
    }),
    prisma.message.count({
      where: {
        recipientId: userId,
        readAt: { not: null },
      },
    }),
    prisma.video.aggregate({
      where: { userId },
      _sum: { views: true },
    }),
    prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        createdAt: true,
        senderId: true,
        recipientId: true,
        sender: {
          select: {
            displayName: true,
            username: true,
          },
        },
        recipient: {
          select: {
            displayName: true,
            username: true,
          },
        },
      },
    }),
    prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: userId }, { recipientId: userId }],
      },
      orderBy: { updatedAt: 'desc' },
      take: 4,
      select: {
        id: true,
        status: true,
        requesterId: true,
        recipientId: true,
        updatedAt: true,
        requester: {
          select: {
            displayName: true,
            username: true,
          },
        },
        recipient: {
          select: {
            displayName: true,
            username: true,
          },
        },
      },
    }),
    prisma.video.count({
      where: { userId },
    }),
    prisma.video.count({
      where: { userId, isPublic: true },
    }),
    prisma.message.count({
      where: {
        recipientId: userId,
        readAt: null,
      },
    }),
    prisma.report.count({
      where: {
        targetId: userId,
        status: 'pending',
      },
    }),
    prisma.profile.findUnique({
      where: { userId },
      select: { updatedAt: true },
    }),
  ])

  const engagementPercent =
    totalReceivedMessagesCount > 0
      ? Math.round((readReceivedMessagesCount / totalReceivedMessagesCount) * 100)
      : 0

  const profileActivity = profile?.updatedAt
    ? [{ id: `profile-${userId}`, action: 'Profile updated', at: profile.updatedAt }]
    : []

  const messageActivity = recentMessages.map((message) => {
    const otherMember = message.senderId === userId ? message.recipient : message.sender
    const otherName = otherMember.displayName || `@${otherMember.username}`
    const action = message.senderId === userId ? `You messaged ${otherName}` : `${otherName} messaged you`

    return {
      id: `message-${message.id}`,
      action,
      at: message.createdAt,
    }
  })

  const friendshipActivity = recentFriendships.map((friendship) => {
    const otherMember = friendship.requesterId === userId ? friendship.recipient : friendship.requester
    const otherName = otherMember.displayName || `@${otherMember.username}`

    let action = `Connection updated with ${otherName}`
    if (friendship.status === 'accepted') {
      action = `You are now connected with ${otherName}`
    } else if (friendship.status === 'pending') {
      action = friendship.requesterId === userId
        ? `You sent a connection request to ${otherName}`
        : `${otherName} sent you a connection request`
    } else if (friendship.status === 'declined') {
      action = `Connection request with ${otherName} was declined`
    }

    return {
      id: `friendship-${friendship.id}`,
      action,
      at: friendship.updatedAt,
    }
  })

  const recentActivity = [...profileActivity, ...messageActivity, ...friendshipActivity]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 6)
    .map((entry) => ({
      id: entry.id,
      action: entry.action,
      time: formatRelativeTime(entry.at),
    }))

  if (recentActivity.length === 0) {
    recentActivity.push({ id: 'activity-empty', action: 'No activity yet', time: 'Just now' })
  }

  return {
    stats: {
      profileViews: profileViewsAggregate._sum.views ?? 0,
      connections: connectionsCount,
      messagesReceived: messagesReceivedCount,
      engagementPercent,
    },
    modelStats: {
      totalVideos: totalVideosCount,
      publicVideos: publicVideosCount,
      unreadMessages: unreadMessagesCount,
      pendingReports: pendingReportsCount,
    },
    recentActivity,
    generatedAt: new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const headerToken = getBearerToken(request.headers.get('authorization'))
  const token = cookieToken || headerToken

  if (!token) {
    return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
  }

  const userId = getUserIdFromToken(token)
  if (!userId) {
    return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
  }

  try {
    const payload = await loadDashboardLivePayload(userId)
    return NextResponse.json(payload)
  } catch {
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
