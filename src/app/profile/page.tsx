import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'

import ProfileEditClient from '@/app/profile/_components/profile-edit-client'
import { AUTH_COOKIE_NAME, ROUTES, SESSION_MODE_DEFAULT_MEMBER } from '@/lib/constants'
import type { AuthTokenPayload } from '@/lib/types'

function getTokenPayload(token: string): AuthTokenPayload | null {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) return null

  try {
    return jwt.verify(token, jwtSecret) as AuthTokenPayload
  } catch {
    return null
  }
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>
}) {
  const params = await searchParams
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

  return <ProfileEditClient initialSetup={params.setup === '1'} />
}
