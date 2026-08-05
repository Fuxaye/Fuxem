import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import CreatorPlatformShell from '@/app/_components/creator-platform-shell'
import { AUTH_COOKIE_NAME, ROUTES, SESSION_MODE_DEFAULT_MEMBER } from '@/lib/constants'
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

async function requireAuthenticatedUserId(): Promise<string> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.PROFILE)}`)
  }

  const payload = getTokenPayload(token)
  if (!payload) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.PROFILE)}`)
  }

  if (payload.mode === SESSION_MODE_DEFAULT_MEMBER) {
    redirect(ROUTES.DASHBOARD)
  }

  const userId =
    (typeof payload.userId === 'string' && payload.userId) ||
    (typeof payload.sub === 'string' && payload.sub) ||
    null

  if (!userId) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.PROFILE)}`)
  }

  return userId
}

export default async function ProfilePage() {
  await requireAuthenticatedUserId()

  return <CreatorPlatformShell initialView="profile" />
}
