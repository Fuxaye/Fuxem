import { NextRequest, NextResponse } from 'next/server'
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk'

import { getAuthenticatedUserId } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { MESSAGES } from '@/lib/constants'

const PUBLIC_ROOM_PREFIX = 'camera-public'
const DIRECT_ROOM_PREFIX = 'camera-direct'

function requireLiveKitEnv() {
  const url = process.env.LIVEKIT_URL
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  if (!url || !apiKey || !apiSecret) {
    return null
  }

  return { url, apiKey, apiSecret }
}

function normalizeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 28)
}

function getInviteBaseUrl() {
  return process.env.APP_URL || process.env.NEXT_PUBLIC_API_URL || ''
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const env = requireLiveKitEnv()
    if (!env) {
      return NextResponse.json({ error: MESSAGES.ROOM_UNAVAILABLE }, { status: 503 })
    }

    const mode = request.nextUrl.searchParams.get('mode') === 'direct' ? 'direct' : 'public'
    const legacyRole = request.nextUrl.searchParams.get('role') === 'viewer' ? 'viewer' : 'host'
    const intentParam = request.nextUrl.searchParams.get('intent')
    const intent = intentParam === 'join' || intentParam === 'broadcast'
      ? intentParam
      : legacyRole === 'viewer'
      ? 'join'
      : 'broadcast'
    const peer = (request.nextUrl.searchParams.get('peer') || request.nextUrl.searchParams.get('host') || '').trim()
    const category = (request.nextUrl.searchParams.get('category') || '').trim().slice(0, 40)
    const locationBadge = (request.nextUrl.searchParams.get('location') || '').trim().slice(0, 40)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, displayName: true, accountName: true },
    })

    if (!user) {
      return NextResponse.json({ error: MESSAGES.LOGIN_INVALID }, { status: 404 })
    }

    const currentAccountSlug = normalizeSegment(user.accountName || user.username || user.id)
    if (!currentAccountSlug) {
      return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
    }

    let roomName = `${PUBLIC_ROOM_PREFIX}-${currentAccountSlug}`
    let canPublish = intent === 'broadcast'
    let peerAccountName: string | null = null

    if (mode === 'direct') {
      if (!peer) {
        return NextResponse.json({ error: 'Choose a member to invite for a 1-on-1 cam room.' }, { status: 400 })
      }

      const peerUser = await prisma.user.findFirst({
        where: {
          OR: [
            { accountName: { equals: peer, mode: 'insensitive' } },
            { username: { equals: peer, mode: 'insensitive' } },
          ],
        },
        select: { id: true, accountName: true, username: true },
      })

      if (!peerUser) {
        return NextResponse.json({ error: 'Member not found for direct cam invite.' }, { status: 404 })
      }

      if (peerUser.id === user.id) {
        return NextResponse.json({ error: 'You cannot create a direct room with yourself.' }, { status: 400 })
      }

      const peerSlug = normalizeSegment(peerUser.accountName || peerUser.username || peerUser.id)
      const pair = [currentAccountSlug, peerSlug].sort()
      roomName = `${DIRECT_ROOM_PREFIX}-${pair[0]}-${pair[1]}`
      canPublish = true
      peerAccountName = peerUser.accountName
    } else if (intent === 'join') {
      if (!peer) {
        return NextResponse.json({ error: 'Enter a host handle to join a public broadcast.' }, { status: 400 })
      }

      const hostUser = await prisma.user.findFirst({
        where: {
          OR: [
            { accountName: { equals: peer, mode: 'insensitive' } },
            { username: { equals: peer, mode: 'insensitive' } },
          ],
        },
        select: { accountName: true, username: true },
      })

      if (!hostUser) {
        return NextResponse.json({ error: 'Host account not found.' }, { status: 404 })
      }

      const hostSlug = normalizeSegment(hostUser.accountName || hostUser.username)
      roomName = `${PUBLIC_ROOM_PREFIX}-${hostSlug}`
      canPublish = false
      peerAccountName = hostUser.accountName
    }

    const identity = user.id
    const name = user.displayName || user.username
    const token = new AccessToken(env.apiKey, env.apiSecret, {
      identity,
      name,
    })

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish,
      canSubscribe: true,
      canPublishData: true,
    })

    // Best effort room creation so the first broadcaster does not depend on manual setup.
    const roomService = new RoomServiceClient(env.url, env.apiKey, env.apiSecret)
    await roomService.createRoom({
      name: roomName,
      metadata: JSON.stringify({
        mode,
        owner: user.accountName,
        category,
        locationBadge,
      }),
    }).catch(() => undefined)

    const base = getInviteBaseUrl()
    const directInvitePath = `/profile/cam?mode=direct&peer=${encodeURIComponent(user.accountName)}`
    const publicInvitePath = `/profile/cam?mode=public&intent=join&host=${encodeURIComponent(user.accountName)}`

    return NextResponse.json({
      token: await token.toJwt(),
      roomName,
      role: canPublish ? 'host' : 'viewer',
      mode,
      intent,
      category,
      locationBadge,
      peerAccountName,
      inviteUrl: mode === 'direct'
        ? `${base}${directInvitePath}`
        : `${base}${publicInvitePath}`,
      livekitUrl: env.url,
      participantName: name,
      participantIdentity: identity,
      accountName: user.accountName,
    })
  } catch (error) {
    console.error('Failed to issue camera token:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
