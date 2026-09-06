import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

import {
  AUTH_COOKIE_NAME,
  VIDEO_PLAYBACK_TOKEN_MAX_AGE_SECONDS,
} from '@/lib/constants'
import prisma from '@/lib/prisma'
import type { AuthTokenPayload, PublicMediaVideo } from '@/lib/types'

const PUBLIC_VIDEO_WHERE = {
  isPublic: true,
  user: {
    role: 'MODEL_VERIFIED' as const,
    status: 'active',
  },
}

export function createPublicPlaybackUrl(videoId: string): string | null {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    return null
  }

  const token = jwt.sign(
    {
      videoId,
      purpose: 'public-playback',
    },
    jwtSecret,
    { expiresIn: VIDEO_PLAYBACK_TOKEN_MAX_AGE_SECONDS }
  )

  return `/api/videos/${encodeURIComponent(videoId)}/play?token=${encodeURIComponent(token)}`
}

async function loadPublicMediaVideos(): Promise<PublicMediaVideo[]> {
  const videos = await prisma.video.findMany({
    where: PUBLIC_VIDEO_WHERE,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      user: {
        select: {
          username: true,
          displayName: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  return videos.map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    playbackUrl: createPublicPlaybackUrl(video.id),
    thumbnailUrl: video.thumbnailUrl,
    creator: video.user.displayName?.trim() || video.user.username,
    tags: video.tags.map(({ tag }) => tag.name),
  }))
}

async function resolveAuthenticatedMember(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  const jwtSecret = process.env.JWT_SECRET

  if (!token || !jwtSecret) {
    return false
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as AuthTokenPayload & { sub?: string }
    const userId =
      (typeof payload.userId === 'string' && payload.userId) ||
      (typeof payload.sub === 'string' && payload.sub) ||
      null

    if (!userId) {
      return false
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    })

    return user?.status === 'active'
  } catch {
    return false
  }
}

export async function getPublicMediaPageData(): Promise<{
  videos: PublicMediaVideo[]
  isAuthenticated: boolean
}> {
  const [videos, isAuthenticated] = await Promise.all([
    loadPublicMediaVideos(),
    resolveAuthenticatedMember(),
  ])

  return { videos, isAuthenticated }
}

