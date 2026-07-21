import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { AUTH_COOKIE_NAME, ROUTES } from '@/lib/constants'
import prisma from '@/lib/prisma'
import type { AuthTokenPayload } from '@/lib/types'

type UserGroupProfilePageProps = {
  params: Promise<{
    userid: string
  }>
}

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

function profileNeedsOnboarding(profile: {
  avatarUrl: string | null
  bio: string | null
  location: string | null
  lookingFor: string[] | null
  interests: string[] | null
} | null): boolean {
  if (!profile) {
    return true
  }

  return (
    !profile.avatarUrl ||
    !profile.bio?.trim() ||
    !profile.location?.trim() ||
    !profile.lookingFor?.length ||
    !profile.interests?.length
  )
}

export default async function UserGroupProfilePage({ params }: UserGroupProfilePageProps) {
  const resolvedParams = await params
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(`/usergroup/${resolvedParams.userid}/profile`)}`)
  }

  const payload = getTokenPayload(token)
  if (!payload) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(`/usergroup/${resolvedParams.userid}/profile`)}`)
  }

  const userId =
    (typeof payload.userId === 'string' && payload.userId) ||
    (typeof payload.sub === 'string' && payload.sub) ||
    null

  if (!userId) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(`/usergroup/${resolvedParams.userid}/profile`)}`)
  }

  if (userId !== resolvedParams.userid) {
    redirect(ROUTES.ME_PROFILE)
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      onboardingStep: true,
      profile: {
        select: {
          avatarUrl: true,
          bio: true,
          location: true,
          lookingFor: true,
          interests: true,
        },
      },
    },
  })

  if (!user) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(`/usergroup/${resolvedParams.userid}/profile`)}`)
  }

  if (user.onboardingStep !== 'completed' || profileNeedsOnboarding(user.profile)) {
    redirect(ROUTES.ONBOARDING)
  }

  redirect(ROUTES.ME_PROFILE)
}