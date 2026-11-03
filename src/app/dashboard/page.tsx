import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { AUTH_COOKIE_NAME, ROUTES, getUserGroupMainRoute, getUserGroupProfileRoute } from '@/lib/constants'
import { getAccountCategoryLabel } from '@/lib/account-category'
import prisma from '@/lib/prisma'
import type { AuthTokenPayload } from '@/lib/types'
import MemberLayout from '@/app/_layouts/member-layout'

import DashboardClient from './_components/dashboard-client'

const DEFAULT_MEMBER_ID = 'default-member'
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000

function getTokenPayload(token: string): AuthTokenPayload | null {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    return null
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as AuthTokenPayload
    return payload
  } catch {
    return null
  }
}

function calculateAgeFromDate(dateOfBirth: Date | null): number | null {
  if (!dateOfBirth) {
    return null
  }

  const now = new Date()
  let age = now.getFullYear() - dateOfBirth.getUTCFullYear()
  const monthDifference = now.getMonth() - dateOfBirth.getUTCMonth()
  const dayDifference = now.getDate() - dateOfBirth.getUTCDate()

  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age -= 1
  }

  return age >= 0 ? age : null
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

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.DASHBOARD)}`)
  }

  const payload = getTokenPayload(token)
  if (!payload) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.DASHBOARD)}`)
  }

  const userId =
    (typeof payload.userId === 'string' && payload.userId) ||
    (typeof payload.sub === 'string' && payload.sub) ||
    null

  if (!userId) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.DASHBOARD)}`)
  }

  if (payload.mode === 'default-member' || userId === DEFAULT_MEMBER_ID) {
    redirect(getUserGroupMainRoute(userId))
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      canAccessDashboard: true,
      username: true,
      accountName: true,
      firstName: true,
      displayName: true,
      personalCode: true,
      profile: {
        select: {
          age: true,
          dateOfBirth: true,
          city: true,
          state: true,
          country: true,
          location: true,
          bio: true,
          lookingFor: true,
          interests: true,
          avatarUrl: true,
          updatedAt: true,
          gender: true,
          genderOther: true,
          sexualOrientation: true,
          orientationOther: true,
        },
      },
    },
  })

  if (!user) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.DASHBOARD)}`)
  }

  if (user.role !== 'MODEL_VERIFIED' && !user.canAccessDashboard) {
    redirect(getUserGroupMainRoute(user.id))
  }

  const accountCategoryLabel = getAccountCategoryLabel(user.role)

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
  ])

  const age = user.profile?.age ?? calculateAgeFromDate(user.profile?.dateOfBirth ?? null)

  const location = user.profile?.location || [user.profile?.city, user.profile?.state, user.profile?.country].filter(Boolean).join(', ')
  const profileViews = profileViewsAggregate._sum.views ?? 0
  const engagementPercent =
    totalReceivedMessagesCount > 0
      ? Math.round((readReceivedMessagesCount / totalReceivedMessagesCount) * 100)
      : 0

  const profileActivity = user.profile?.updatedAt
    ? [{ id: `profile-${user.id}`, action: 'Profile updated', at: user.profile.updatedAt }]
    : []

  const messageActivity = recentMessages.map((message) => {
    const otherMember =
      message.senderId === userId ? message.recipient : message.sender
    const otherName = otherMember.displayName || `@${otherMember.username}`
    const action =
      message.senderId === userId
        ? `You messaged ${otherName}`
        : `${otherName} messaged you`

    return {
      id: `message-${message.id}`,
      action,
      at: message.createdAt,
    }
  })

  const friendshipActivity = recentFriendships.map((friendship) => {
    const otherMember =
      friendship.requesterId === userId ? friendship.recipient : friendship.requester
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

  const profileIsIncomplete =
    !user.profile?.avatarUrl ||
    !user.profile?.bio?.trim() ||
    !location.trim() ||
    !user.profile?.lookingFor?.length ||
    !user.profile?.interests?.length

  const profileHref = profileIsIncomplete
    ? ROUTES.ONBOARDING
    : getUserGroupProfileRoute(user.id)

  return (
    <MemberLayout
      initialUser={{
        id: user.id,
        username: user.username,
        firstName: user.firstName || user.displayName || user.username,
        displayName: user.displayName,
        avatarUrl: user.profile?.avatarUrl ?? undefined,
        profileHref,
        accountCategoryLabel,
      }}
    >
      <DashboardClient
        initialData={{
          user: {
            id: user.id,
            username: user.username,
            accountName: user.accountName,
            firstName: user.firstName || user.displayName || user.username,
            displayName: user.displayName,
            personalCode: user.personalCode,
          },
          account: {
            role: user.role,
            isModelVerified: user.role === 'MODEL_VERIFIED',
          },
          profile: {
            age,
            location,
            bio: user.profile?.bio || '',
            lookingFor: user.profile?.lookingFor || [],
            interests: user.profile?.interests || [],
            avatarUrl: user.profile?.avatarUrl || '',
            city: user.profile?.city || '',
            state: user.profile?.state || '',
            country: user.profile?.country || '',
            gender: user.profile?.gender || '',
            genderOther: user.profile?.genderOther || '',
            sexualOrientation: user.profile?.sexualOrientation || '',
            orientationOther: user.profile?.orientationOther || '',
          },
          stats: {
            profileViews,
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
        }}
      />
    </MemberLayout>
  )
}
