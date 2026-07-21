import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { MESSAGES } from '@/lib/constants'
import prisma from '@/lib/prisma'

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

async function getRequester(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request)
  if (!userId) {
    return null
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  })
}

function canManageVideo(requester: { id: string; role: string }, ownerId: string): boolean {
  if (requester.id === ownerId) {
    return true
  }

  return requester.role === 'ADMIN' || requester.role === 'SUPREME_ADMIN'
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const requester = await getRequester(request)
    if (!requester) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const { id } = await context.params

    const existing = await prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: MESSAGES.VIDEO_NOT_FOUND }, { status: 404 })
    }

    if (!canManageVideo(requester, existing.userId)) {
      return NextResponse.json({ error: MESSAGES.VIDEO_FORBIDDEN }, { status: 403 })
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null

    if (!body) {
      return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 400 })
    }

    const nextTitle = normalizeOptionalString(body.title)
    const nextDescription = normalizeOptionalString(body.description)
    const nextVideoUrl = normalizeOptionalString(body.videoUrl)
    const nextThumbnailUrl = normalizeOptionalString(body.thumbnailUrl)
    const nextIsPublic = typeof body.isPublic === 'boolean' ? body.isPublic : undefined

    const video = await prisma.video.update({
      where: { id },
      data: {
        ...(nextTitle !== null ? { title: nextTitle } : {}),
        ...(nextDescription !== null ? { description: nextDescription } : {}),
        ...(nextVideoUrl !== null ? { videoUrl: nextVideoUrl } : {}),
        ...(nextThumbnailUrl !== null ? { thumbnailUrl: nextThumbnailUrl } : {}),
        ...(typeof nextIsPublic === 'boolean' ? { isPublic: nextIsPublic } : {}),
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
    console.error('Failed to update video:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const requester = await getRequester(request)
    if (!requester) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const { id } = await context.params

    const existing = await prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: MESSAGES.VIDEO_NOT_FOUND }, { status: 404 })
    }

    if (!canManageVideo(requester, existing.userId)) {
      return NextResponse.json({ error: MESSAGES.VIDEO_FORBIDDEN }, { status: 403 })
    }

    await prisma.video.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete video:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
