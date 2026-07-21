import jwt from 'jsonwebtoken'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import MemberLayout from '@/app/_layouts/member-layout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AUTH_COOKIE_NAME, ROUTES, getUserGroupProfileRoute } from '@/lib/constants'
import { getAccountCategoryLabel } from '@/lib/account-category'
import prisma from '@/lib/prisma'
import type { AuthTokenPayload } from '@/lib/types'
import { Bell, History, MessageSquare, MoonStar, MapPin, Sparkles } from 'lucide-react'

type UserGroupMainPageProps = {
  params: Promise<{
    userid: string
  }>
}

const DEFAULT_MEMBER_ID = 'default-member'
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000

function getTokenPayload(token: string): AuthTokenPayload | null {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    return null
  }

  try {
    return jwt.verify(token, jwtSecret) as AuthTokenPayload
  } catch {
    return null
  }
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

export default async function UserGroupMainPage({ params }: UserGroupMainPageProps) {
  const resolvedParams = await params
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(`/usergroup/${resolvedParams.userid}/main`)}`)
  }

  const payload = getTokenPayload(token)
  if (!payload) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(`/usergroup/${resolvedParams.userid}/main`)}`)
  }

  const userId =
    (typeof payload.userId === 'string' && payload.userId) ||
    (typeof payload.sub === 'string' && payload.sub) ||
    null

  if (!userId) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(`/usergroup/${resolvedParams.userid}/main`)}`)
  }

  if (userId !== resolvedParams.userid) {
    redirect(ROUTES.DASHBOARD)
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
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
          updatedAt: true,
        },
      },
    },
  })

  if (user?.role === 'MODEL_VERIFIED') {
    redirect(ROUTES.DASHBOARD)
  }

  if (user && user.onboardingStep !== 'completed') {
    redirect(ROUTES.ONBOARDING)
  }

  const isPreview = !user || userId === DEFAULT_MEMBER_ID || payload.mode === 'default-member'
  const displayName = user?.displayName || user?.firstName || payload.username || 'Member'
  const username = user?.username || payload.username || 'defaultuser'
  const locationLabel =
    user?.profile?.location ||
    [user?.profile?.city, user?.profile?.state, user?.profile?.country].filter(Boolean).join(', ') ||
    'Your local area'
  const accountCategoryLabel = getAccountCategoryLabel(user?.role ?? 'BURNER')
  const profileHref = isPreview || !user?.profile?.avatarUrl || !user?.profile?.bio?.trim()
    ? ROUTES.ONBOARDING
    : getUserGroupProfileRoute(userId)

  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_IN_MS)
  const [recentMessages, recentFriendships, totalUnreadMessages, recentActivity] = await Promise.all([
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
        sender: { select: { displayName: true, username: true } },
        recipient: { select: { displayName: true, username: true } },
      },
    }),
    prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: userId }, { recipientId: userId }],
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
        recipientId: userId,
        readAt: null,
      },
    }),
    prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
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
      const other = friendship.requesterId === userId ? friendship.recipient : friendship.requester
      const otherName = other.displayName || `@${other.username}`
      return `Connection request from ${otherName}`
    }),
  ].slice(0, 4)

  const activity = recentActivity.map((entry) => {
    const otherMember = entry.senderId === userId ? entry.recipient : entry.sender
    const otherName = otherMember.displayName || `@${otherMember.username}`
    const action = entry.senderId === userId ? `You messaged ${otherName}` : `${otherName} messaged you`

    return {
      id: entry.id,
      action,
      time: formatRelativeTime(entry.createdAt),
    }
  })

  const moonPhaseLabel = getMoonPhaseLabel(new Date())

  return (
    <MemberLayout
      initialUser={{
        id: userId,
        username,
        firstName: user?.firstName || displayName,
        displayName,
        avatarUrl: user?.profile?.avatarUrl ?? undefined,
        profileHref,
        accountCategoryLabel,
      }}
      isBurner={isPreview}
    >
      <div className="relative min-h-screen overflow-hidden p-4 md:p-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <main className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-3xl border border-cyan-200/20 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-cyan-950/50 p-5 shadow-[0_16px_60px_-30px_rgba(56,189,248,0.35)] backdrop-blur-md md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Member Home</p>
                <h1 className="text-2xl font-semibold text-white md:text-3xl">Welcome back, {displayName}</h1>
                <p className="max-w-2xl text-sm text-slate-200/75 md:text-base">
                  Notifications, recent messages, and history stay on the front page. Your moon phase theme stays anchored to your location.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge className="border border-cyan-300/30 bg-cyan-500/15 text-cyan-100">
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Live Home
                  </Badge>
                  <Badge className="border border-white/15 bg-white/5 text-slate-200">
                    <MapPin className="mr-1 h-3.5 w-3.5" />
                    {locationLabel}
                  </Badge>
                  <Badge className="border border-white/15 bg-white/5 text-slate-200">
                    <MoonStar className="mr-1 h-3.5 w-3.5" />
                    {moonPhaseLabel}
                  </Badge>
                </div>
              </div>

              <Link
                href={profileHref}
                className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15"
              >
                My Profile
              </Link>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="border-border-subtle/50 bg-bg-surface/60 backdrop-blur lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-4 w-4 text-champagne" />
                  Notifications
                </CardTitle>
                <CardDescription>Things that need attention first</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.length > 0 ? notifications.map((item) => (
                  <div key={item} className="rounded-2xl border border-border-subtle/50 bg-black/10 p-3 text-sm text-text-primary">
                    {item}
                  </div>
                )) : (
                  <p className="text-sm text-text-muted">No new notifications right now.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border-subtle/50 bg-bg-surface/60 backdrop-blur lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-4 w-4 text-champagne" />
                  Recent Messages
                </CardTitle>
                <CardDescription>Your latest inbound and outbound messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentMessages.length > 0 ? recentMessages.map((message) => {
                  const otherMember = message.senderId === userId ? message.recipient : message.sender
                  const otherName = otherMember.displayName || `@${otherMember.username}`

                  return (
                    <div key={message.id} className="flex items-center justify-between rounded-2xl border border-border-subtle/50 bg-black/10 p-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{message.senderId === userId ? `You to ${otherName}` : otherName}</p>
                        <p className="text-xs text-text-muted">Active in your inbox</p>
                      </div>
                      <p className="text-xs text-text-muted">{formatRelativeTime(message.createdAt)}</p>
                    </div>
                  )
                }) : (
                  <p className="text-sm text-text-muted">No recent messages to show.</p>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="border-border-subtle/50 bg-bg-surface/60 backdrop-blur lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="h-4 w-4 text-champagne" />
                  History
                </CardTitle>
                <CardDescription>Recent activity over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activity.length > 0 ? activity.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-border-subtle/50 bg-black/10 p-3">
                    <p className="text-sm text-text-primary">{entry.action}</p>
                    <p className="text-xs text-text-muted">{entry.time}</p>
                  </div>
                )) : (
                  <p className="text-sm text-text-muted">No activity yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border-subtle/50 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-cyan-950/40 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <MoonStar className="h-4 w-4 text-champagne" />
                  Moon Theme
                </CardTitle>
                <CardDescription className="text-slate-300/75">Permanent location-based theme element</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-100">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">Current phase</p>
                  <p className="mt-2 text-2xl font-semibold">{moonPhaseLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200/75">
                  Anchored to {locationLabel}. The same theme stays visible across your member home.
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">
                  {isPreview ? 'Preview mode is limited, but the member home stays readable and usable.' : 'Your member home is tuned for direct social signals first.'}
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </MemberLayout>
  )
}