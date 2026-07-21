import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { MESSAGES } from '@/lib/constants'
import prisma from '@/lib/prisma'

type PublicPlaybackTokenPayload = {
  videoId?: string
  purpose?: string
}

function isValidPublicPlaybackToken(token: string | null, videoId: string): boolean {
  if (!token) {
    return false
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    return false
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as PublicPlaybackTokenPayload
    return payload.purpose === 'public-playback' && payload.videoId === videoId
  } catch {
    return false
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const video = await prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        videoUrl: true,
        isPublic: true,
      },
    })

    if (!video) {
      return NextResponse.json({ error: MESSAGES.VIDEO_NOT_FOUND }, { status: 404 })
    }

    const requesterId = await getAuthenticatedUserId(request)
    const playbackToken = request.nextUrl.searchParams.get('token')

    const canPlayPublic = video.isPublic && (
      Boolean(requesterId) || isValidPublicPlaybackToken(playbackToken, video.id)
    )

    const canPlayPrivate = Boolean(requesterId) && (
      requesterId === video.userId
    )

    if (!canPlayPublic && !canPlayPrivate) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    return NextResponse.redirect(video.videoUrl)
  } catch (error) {
    console.error('Failed to generate playback response:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
