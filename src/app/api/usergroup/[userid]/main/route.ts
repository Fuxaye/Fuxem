import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { MESSAGES, ROUTES } from '@/lib/constants'
import prisma from '@/lib/prisma'

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000

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
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function getMoonPhaseLabel(date: Date): string {
  const synodicMonth = 29.53058867
  const reference = Date.UTC(2000, 0, 6, 18, 14)
  const daysSinceReference = (date.getTime() - reference) / (1000 * 60 * 60 * 24)
  const phase = ((daysSinceReference % synodicMonth) + synodicMonth) / synodicMonth

  if (phase < 0.03 || phase > 0.97) return 'New Moon'
  if (phase < 0.22) return 'Waxing Crescent'
  if (phase < 0.28) return 'First Quarter'
  if (phase < 0.47) return 'Waxing Gibbous'
  if (phase < 0.53) return 'Full Moon'
  if (phase < 0.72) return 'Waning Gibbous'
  if (phase < 0.78) return 'Last Quarter'
  return 'Waning Crescent'
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userid: string }> }
) {
  try {
    const { userid } = await context.params
    const authenticatedUserId = await getAuthenticatedUserId(request)

    if (!authenticatedUserId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    if (authenticatedUserId !== userid) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userid },
      select: {
        id: true,
        role: true,
        username: true,
        displayName: true,
        firstName: true,
        onboardingStep: true,
        profile: {
          select: {
            avatarUrl: true,
            bio: true,
            location: true,
            city: true,
            state: true,
            country: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: MESSAGES.LOGIN_INVALID }, { status: 404 })
    }

    if (user.role === 'MODEL_VERIFIED') {
      return NextResponse.json({ redirectTo: ROUTES.DASHBOARD }, { status: 200 })
    }

    if (user.onboardingStep !== 'completed') {
      return NextResponse.json({ redirectTo: ROUTES.ONBOARDING }, { status: 200 })
    }

    const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_IN_MS)

    const [recentMessages, recentFriendships, totalUnreadMessages, recentActivity] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [{ senderId: userid }, { recipientId: userid }],
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          id: true,
          createdAt: true,
          senderId: true,
          recipientId: true,
          sender: { select: { displayName: true, username: true } },
          recipient: { select: { displayName: true, username: true } },
        },
      }),
      prisma.friendship.findMany({
        where: {
          OR: [{ requesterId: userid }, { recipientId: userid }],
          status: 'pending',
        },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: {
          id: true,
          updatedAt: true,
          requesterId: true,
          recipientId: true,
          requester: { select: { displayName: true, username: true } },
          recipient: { select: { displayName: true, username: true } },
        },
      }),
      prisma.message.count({
        where: {
          recipientId: userid,
          readAt: null,
        },
      }),
      prisma.message.findMany({
        where: {
          OR: [{ senderId: userid }, { recipientId: userid }],
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          createdAt: true,
          senderId: true,
          recipientId: true,
          sender: { select: { displayName: true, username: true } },
          recipient: { select: { displayName: true, username: true } },
        },
      }),
    ])

    const notifications = [
      ...(totalUnreadMessages > 0 ? [`${totalUnreadMessages} unread message${totalUnreadMessages === 1 ? '' : 's'}`] : []),
      ...recentFriendships.map((friendship) => {
        const other = friendship.requesterId === userid ? friendship.recipient : friendship.requester
        const otherName = other.displayName || `@${other.username}`
        return `Connection request from ${otherName}`
      }),
    ].slice(0, 4)

    const activity = recentActivity.map((entry) => {
      const otherMember = entry.senderId === userid ? entry.recipient : entry.sender
      const otherName = otherMember.displayName || `@${otherMember.username}`
      const action = entry.senderId === userid ? `You messaged ${otherName}` : `${otherName} messaged you`

      return {
        id: entry.id,
        action,
        time: formatRelativeTime(entry.createdAt),
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        firstName: user.firstName,
        role: user.role,
        profile: {
          avatarUrl: user.profile?.avatarUrl || null,
          bio: user.profile?.bio || null,
          location: user.profile?.location || null,
          city: user.profile?.city || null,
          state: user.profile?.state || null,
          country: user.profile?.country || null,
        },
      },
      summary: {
        notifications,
        recentMessages: recentMessages.map((message) => {
          const otherMember = message.senderId === userid ? message.recipient : message.sender
          const otherName = otherMember.displayName || `@${otherMember.username}`

          return {
            id: message.id,
            label: message.senderId === userid ? `You to ${otherName}` : otherName,
            at: message.createdAt,
            relativeTime: formatRelativeTime(message.createdAt),
          }
        }),
        history: activity,
        moonPhase: getMoonPhaseLabel(new Date()),
      },
    })
  } catch (error) {
    console.error('Failed to fetch usergroup main payload:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
