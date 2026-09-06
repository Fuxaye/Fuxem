import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Red_Hat_Text } from 'next/font/google'

import MemberLayout from '@/app/_layouts/member-layout'
import { AUTH_COOKIE_NAME, ROUTES, getUserGroupProfileRoute } from '@/lib/constants'
import { getAccountCategoryLabel } from '@/lib/account-category'
import prisma from '@/lib/prisma'
import type { AuthTokenPayload } from '@/lib/types'

import MyVideosClient from './_components/my-videos-client'

const redHatText = Red_Hat_Text({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
})

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

export default async function MyVideosPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.MY_VIDEOS)}`)
  }

  const payload = getTokenPayload(token)
  if (!payload) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.MY_VIDEOS)}`)
  }

  const userId =
    (typeof payload.userId === 'string' && payload.userId) ||
    (typeof payload.sub === 'string' && payload.sub) ||
    null

  if (!userId) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.MY_VIDEOS)}`)
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      username: true,
      firstName: true,
      displayName: true,
      profile: {
        select: {
          avatarUrl: true,
          bio: true,
        },
      },
    },
  })

  if (!user) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.MY_VIDEOS)}`)
  }

  if (user.role !== 'MODEL_VERIFIED') {
    redirect(ROUTES.PUBLIC_STREAM)
  }

  const accountCategoryLabel = getAccountCategoryLabel(user.role)

  const profileHref = !user.profile?.avatarUrl || !user.profile?.bio?.trim()
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
      <div className={redHatText.variable}>
        <MyVideosClient />
      </div>
    </MemberLayout>
  )
}
