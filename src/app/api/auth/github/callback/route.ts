import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

import {
  AUTH_COOKIE_NAME,
  BURNER_TOKEN_MAX_AGE_SECONDS,
  ROUTES,
  SESSION_MODE_COOKIE_NAME,
  SESSION_MODE_MEMBER,
} from '@/lib/constants'
import { generateNextAccountName } from '@/lib/account-name'
import type { AuthTokenPayload } from '@/lib/types'

type GitHubUserResponse = {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string | null
}

function getApprovedDevUsernames(): Set<string> {
  const envDevs = process.env.APPROVED_GITHUB_DEVS || ''
  const usernames = envDevs
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  return new Set(usernames)
}

async function generateUniquePersonalCode(baseCode: string, tx: Prisma.TransactionClient): Promise<string> {
  const normalizedBase = baseCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
  let attempt = 0

  while (attempt < 10) {
    const suffix = attempt === 0 ? '' : String(attempt)
    const personalCode = `${normalizedBase}${suffix}`.slice(0, 12)
    const existing = await tx.user.findUnique({
      where: { personalCode },
      select: { id: true },
    })

    if (!existing) {
      return personalCode
    }

    attempt += 1
  }

  return `DEV${Date.now().toString().slice(-6)}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = request.cookies.get('gh_oauth_state')?.value

  const welcomeUrl = new URL(ROUTES.WELCOME, request.url)

  if (!code || !state || !storedState || state !== storedState) {
    welcomeUrl.searchParams.set('error', 'invalid_oauth_state')
    const res = NextResponse.redirect(welcomeUrl)
    res.cookies.delete('gh_oauth_state')
    return res
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  const jwtSecret = process.env.JWT_SECRET

  if (!clientId || !clientSecret || !jwtSecret) {
    welcomeUrl.searchParams.set('error', 'github_not_configured')
    const res = NextResponse.redirect(welcomeUrl)
    res.cookies.delete('gh_oauth_state')
    return res
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    const tokenData = (await tokenResponse.json()) as { access_token?: string; error?: string }

    if (!tokenResponse.ok || !tokenData.access_token) {
      welcomeUrl.searchParams.set('error', 'github_auth_failed')
      const res = NextResponse.redirect(welcomeUrl)
      res.cookies.delete('gh_oauth_state')
      return res
    }

    // 2. Fetch authenticated user details from GitHub API
    const ghUserResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'Fuxem-App',
      },
    })

    if (!ghUserResponse.ok) {
      welcomeUrl.searchParams.set('error', 'github_user_fetch_failed')
      const res = NextResponse.redirect(welcomeUrl)
      res.cookies.delete('gh_oauth_state')
      return res
    }

    const ghUser = (await ghUserResponse.json()) as GitHubUserResponse
    const ghUsername = ghUser.login.toLowerCase()

    // 3. Verify GitHub username is on approved developer list
    const approvedDevs = getApprovedDevUsernames()
    if (!approvedDevs.has(ghUsername)) {
      welcomeUrl.searchParams.set('error', 'unauthorized_developer')
      welcomeUrl.searchParams.set('gh_user', ghUsername)
      const res = NextResponse.redirect(welcomeUrl)
      res.cookies.delete('gh_oauth_state')
      return res
    }

    // 4. Find or create admin user with full access
    const devUser = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findFirst({
        where: {
          OR: [
            { username: ghUsername },
            { username: `gh_${ghUsername}` },
            ...(ghUser.email ? [{ email: ghUser.email }] : []),
          ],
        },
        select: { id: true, username: true, displayName: true, personalCode: true, role: true },
      })

      if (existing) {
        const updated = await tx.user.update({
          where: { id: existing.id },
          data: {
            role: 'ADMIN',
            canAccessDashboard: true,
            status: 'active',
            emailVerified: true,
            onboardingStep: 'completed',
          },
          select: { id: true, username: true, displayName: true, personalCode: true, role: true },
        })

        if (ghUser.avatar_url) {
          await tx.profile.upsert({
            where: { userId: existing.id },
            create: {
              userId: existing.id,
              avatarUrl: ghUser.avatar_url,
              photoUrls: [],
              videoUrls: [],
              interests: [],
              lookingFor: [],
            },
            update: {
              avatarUrl: ghUser.avatar_url,
            },
          })
        }

        return updated
      }

      const accountName = await generateNextAccountName(tx)
      const personalCode = await generateUniquePersonalCode(`DEV${Date.now().toString().slice(-6)}`, tx)

      const created = await tx.user.create({
        data: {
          username: ghUsername,
          displayName: ghUser.name || ghUser.login,
          email: ghUser.email || null,
          accountName,
          personalCode,
          role: 'ADMIN',
          canAccessDashboard: true,
          status: 'active',
          emailVerified: true,
          onboardingStep: 'completed',
        },
        select: { id: true, username: true, displayName: true, personalCode: true, role: true },
      })

      await tx.profile.create({
        data: {
          userId: created.id,
          avatarUrl: ghUser.avatar_url || undefined,
          photoUrls: [],
          videoUrls: [],
          interests: [],
          lookingFor: [],
        },
      })

      return created
    })

    // 5. Log audit event
    await prisma.adminAuditLog.create({
      data: {
        actorUserId: devUser.id,
        action: 'DEV_GITHUB_OAUTH_LOGIN',
        reason: `Approved GitHub developer access for @${ghUser.login}`,
        afterState: {
          githubUsername: ghUser.login,
          githubId: ghUser.id,
          role: devUser.role,
        },
      },
    })

    // 6. Sign 7-day token
    const tokenPayload: AuthTokenPayload = {
      userId: devUser.id,
      personalCode: devUser.personalCode,
      mode: SESSION_MODE_MEMBER,
      sub: devUser.id,
      username: devUser.username,
    }

    const token = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: BURNER_TOKEN_MAX_AGE_SECONDS,
    })

    const adminRedirectUrl = new URL(ROUTES.ADMIN, request.url)
    const response = NextResponse.redirect(adminRedirectUrl)

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: BURNER_TOKEN_MAX_AGE_SECONDS,
    })

    response.cookies.set({
      name: SESSION_MODE_COOKIE_NAME,
      value: SESSION_MODE_MEMBER,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: BURNER_TOKEN_MAX_AGE_SECONDS,
    })

    response.cookies.delete('gh_oauth_state')

    return response
  } catch (error) {
    console.error('GitHub OAuth dev login error:', error)
    welcomeUrl.searchParams.set('error', 'github_auth_exception')
    const res = NextResponse.redirect(welcomeUrl)
    res.cookies.delete('gh_oauth_state')
    return res
  }
}
