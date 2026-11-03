import jwt from 'jsonwebtoken'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import MemberLayout from '@/app/_layouts/member-layout'
import { getAccountCategoryLabel } from '@/lib/account-category'
import {
  AUTH_COOKIE_NAME,
  ROUTES,
  SESSION_MODE_DEFAULT_MEMBER,
  getUserGroupProfileRoute,
} from '@/lib/constants'
import prisma from '@/lib/prisma'
import type { AuthTokenPayload } from '@/lib/types'

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

const accountLinks = [
  {
    title: 'Edit profile',
    description: 'Photos, bio, and how you show up to other members.',
    href: ROUTES.PROFILE,
  },
  {
    title: 'Public profile',
    description: 'See your page as others see it.',
    href: null as string | null,
  },
  {
    title: 'Settings',
    description: 'Password, email alerts, and account preferences.',
    href: ROUTES.ME_SETTINGS,
  },
  {
    title: 'Messages',
    description: 'Direct conversations with connections.',
    href: ROUTES.ME_MESSAGES,
  },
  {
    title: 'Videos',
    description: 'Your uploads and visibility.',
    href: ROUTES.ME_VIDEOS,
  },
  {
    title: 'Friends',
    description: 'Requests and your network.',
    href: ROUTES.FRIENDS,
  },
] as const

export default async function MePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.ME)}`)
  }

  const payload = getTokenPayload(token)
  if (!payload) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.ME)}`)
  }

  const userId =
    (typeof payload.userId === 'string' && payload.userId) ||
    (typeof payload.sub === 'string' && payload.sub) ||
    null

  if (!userId) {
    redirect(ROUTES.DASHBOARD)
  }

  if (payload.mode === SESSION_MODE_DEFAULT_MEMBER) {
    redirect(ROUTES.DASHBOARD)
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      accountName: true,
      firstName: true,
      displayName: true,
      role: true,
      profile: {
        select: {
          avatarUrl: true,
          bio: true,
          city: true,
          state: true,
          country: true,
          lookingFor: true,
          interests: true,
        },
      },
    },
  })

  if (!user?.username) {
    redirect(ROUTES.DASHBOARD)
  }

  const location = [user.profile?.city, user.profile?.state, user.profile?.country]
    .filter(Boolean)
    .join(', ')

  const profileIsIncomplete =
    !user.profile?.avatarUrl ||
    !user.profile?.bio?.trim() ||
    !location.trim() ||
    !user.profile?.lookingFor?.length ||
    !user.profile?.interests?.length

  const profileHref = profileIsIncomplete ? ROUTES.ONBOARDING : getUserGroupProfileRoute(user.id)
  const publicProfileHref = `/u/${user.username}`
  const accountCategoryLabel = getAccountCategoryLabel(user.role)

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
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted">Your account</p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary sm:text-3xl">
          {user.displayName || user.username}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          @{user.username}
          {user.accountName ? (
            <span className="text-text-muted"> · {user.accountName}</span>
          ) : null}
        </p>

        {profileIsIncomplete ? (
          <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            Finish your profile so members can find you.{' '}
            <Link href={ROUTES.ONBOARDING} className="font-medium underline underline-offset-2">
              Continue setup
            </Link>
          </p>
        ) : null}

        <ul className="mt-8 grid gap-3">
          {accountLinks.map((item) => {
            const href =
              item.title === 'Public profile' ? publicProfileHref : item.href

            if (!href) {
              return null
            }

            return (
              <li key={item.title}>
                <Link
                  href={href}
                  className="block rounded-2xl border border-border-subtle bg-bg-card/80 px-5 py-4 transition hover:border-[#7C5CFC]/40 hover:bg-bg-surface"
                >
                  <span className="text-base font-medium text-text-primary">{item.title}</span>
                  <span className="mt-1 block text-sm text-text-muted">{item.description}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        <Link
          href={ROUTES.DASHBOARD}
          className="mt-8 inline-block text-sm text-text-muted underline-offset-4 hover:text-text-primary hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    </MemberLayout>
  )
}
