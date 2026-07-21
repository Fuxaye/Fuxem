import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { MESSAGES } from '@/lib/constants'
import prisma from '@/lib/prisma'

function parseMineFlag(value: string | null): boolean {
  if (!value) {
    return false
  }

  const normalized = value.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function slugifySegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function buildPublicAliasPath(params: {
  accountName?: string | null
  username: string
  title: string
  videoId: string
  isPublic: boolean
}): string | null {
  if (!params.isPublic) {
    return null
  }

  const artistBase = params.accountName || params.username
  const artistSlug = slugifySegment(artistBase) || 'artist'
  const titleSlug = slugifySegment(params.title) || 'video'

  return `model/videos/${artistSlug}/${params.videoId}-${titleSlug}`
}

export async function GET(request: NextRequest) {
  try {
    const mine = parseMineFlag(request.nextUrl.searchParams.get('mine'))

    if (mine) {
      const userId = await getAuthenticatedUserId(request)
      if (!userId) {
        return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
      }

      const videos = await prisma.video.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              accountName: true,
              username: true,
              displayName: true,
              profile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
        },
      })

      const normalized = videos.map((video) => ({
        ...video,
        publicAliasPath: buildPublicAliasPath({
          accountName: video.user.accountName,
          username: video.user.username,
          title: video.title,
          videoId: video.id,
          isPublic: video.isPublic,
        }),
        user: {
          id: video.user.id,
          username: video.user.username,
          displayName: video.user.displayName,
          avatarUrl: video.user.profile?.avatarUrl ?? null,
        },
      }))

      return NextResponse.json({ videos: normalized })
    }

    const videos = await prisma.video.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            accountName: true,
            username: true,
            displayName: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    })

    const normalized = videos.map((video) => ({
      ...video,
      publicAliasPath: buildPublicAliasPath({
        accountName: video.user.accountName,
        username: video.user.username,
        title: video.title,
        videoId: video.id,
        isPublic: video.isPublic,
      }),
      user: {
        id: video.user.id,
        username: video.user.username,
        displayName: video.user.displayName,
        avatarUrl: video.user.profile?.avatarUrl ?? null,
      },
    }))

    return NextResponse.json({ videos: normalized })
  } catch (error) {
    console.error('Failed to list videos:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        accountName: true,
        username: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: MESSAGES.LOGIN_INVALID }, { status: 404 })
    }

    // Posting videos is restricted to verified model accounts.
    if (user.role !== 'MODEL_VERIFIED') {
      return NextResponse.json({ error: MESSAGES.VIDEO_FORBIDDEN }, { status: 403 })
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null

    if (!body) {
      return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 400 })
    }

    const title = normalizeOptionalString(body.title)
    const videoUrl = normalizeOptionalString(body.videoUrl)
    const description = normalizeOptionalString(body.description)
    const thumbnailUrl = normalizeOptionalString(body.thumbnailUrl)
    const isPublic = typeof body.isPublic === 'boolean' ? body.isPublic : false
    const ownershipCertified = body.ownershipCertified === true

    if (!title || !videoUrl) {
      return NextResponse.json({ error: MESSAGES.FIELD_REQUIRED }, { status: 400 })
    }

    if (isPublic && !ownershipCertified) {
      return NextResponse.json(
        { error: 'Certification is required when posting a video as Public.' },
        { status: 400 }
      )
    }

    const video = await prisma.video.create({
      data: {
        userId,
        title,
        description,
        videoUrl,
        thumbnailUrl,
        isPublic,
      },
      include: {
        user: {
          select: {
            id: true,
            accountName: true,
            username: true,
            displayName: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      video: {
        ...video,
        publicAliasPath: buildPublicAliasPath({
          accountName: video.user.accountName,
          username: video.user.username,
          title: video.title,
          videoId: video.id,
          isPublic: video.isPublic,
        }),
        user: {
          id: video.user.id,
          username: video.user.username,
          displayName: video.user.displayName,
          avatarUrl: video.user.profile?.avatarUrl ?? null,
        },
      },
    })
  } catch (error) {
    console.error('Failed to create video:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
