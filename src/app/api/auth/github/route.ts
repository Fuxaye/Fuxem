import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

import { ROUTES } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID

  if (!clientId) {
    const errorUrl = new URL(ROUTES.WELCOME, request.url)
    errorUrl.searchParams.set('error', 'github_not_configured')
    return NextResponse.redirect(errorUrl)
  }

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_API_URL || request.nextUrl.origin
  const redirectUri = `${appUrl.replace(/\/$/, '')}${ROUTES.AUTH_GITHUB_CALLBACK}`

  const state = crypto.randomBytes(24).toString('hex')

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
  githubAuthUrl.searchParams.set('client_id', clientId)
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri)
  githubAuthUrl.searchParams.set('scope', 'read:user user:email')
  githubAuthUrl.searchParams.set('state', state)

  const response = NextResponse.redirect(githubAuthUrl.toString())

  response.cookies.set('gh_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  })

  return response
}
