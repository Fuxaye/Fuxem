import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { getMemberMediaPolicy } from '@/lib/member-media-policy'
import prisma from '@/lib/prisma'

type MediaKind = 'photo' | 'video'

function sanitizeUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  if (!trimmed.startsWith('https://') && !trimmed.startsWith('data:')) {
    return null
  }

  return trimmed
}

async function getMemberMediaState(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      isPremium: true,
      profile: {
        select: {
          photoUrls: true,
          videoUrls: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  const policy = getMemberMediaPolicy({ role: user.role, isPremium: user.isPremium })
  const photoUrls = user.profile?.photoUrls || []
  const videoUrls = user.profile?.videoUrls || []

  return {
    policy,
    photoUrls,
    videoUrls,
    counts: {
      photos: photoUrls.length,
      videos: videoUrls.length,
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const mediaState = await getMemberMediaState(userId)
    if (!mediaState) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 })
    }

    return NextResponse.json(mediaState)
  } catch (error) {
    console.error('Failed to load member media state:', error)
    return NextResponse.json({ error: 'Unable to load media state.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const body = (await request.json().catch(() => null)) as
      | {
          kind?: MediaKind
          url?: string
          watermarked?: boolean
        }
      | null

    if (!body) {
      return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 })
    }

    const kind = body.kind
    const mediaUrl = sanitizeUrl(body.url)

    if ((kind !== 'photo' && kind !== 'video') || !mediaUrl) {
      return NextResponse.json({ error: 'A valid media type and URL are required.' }, { status: 400 })
    }

    const mediaState = await getMemberMediaState(userId)
    if (!mediaState) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 })
    }

    const { policy } = mediaState

    if (kind === 'video' && !policy.allowVideos) {
      return NextResponse.json({ error: 'Your account cannot upload videos.' }, { status: 403 })
    }

    if (kind === 'photo' && policy.requireWatermark && body.watermarked !== true) {
      return NextResponse.json({ error: 'Burner photos must be watermarked.' }, { status: 400 })
    }

    const nextPhotoUrls =
      kind === 'photo'
        ? Array.from(new Set([mediaUrl, ...mediaState.photoUrls]))
        : mediaState.photoUrls

    const nextVideoUrls =
      kind === 'video'
        ? Array.from(new Set([mediaUrl, ...mediaState.videoUrls]))
        : mediaState.videoUrls

    if (policy.maxPhotos !== null && nextPhotoUrls.length > policy.maxPhotos) {
      return NextResponse.json({ error: `Photo limit reached (${policy.maxPhotos} max).` }, { status: 403 })
    }

    if (policy.maxVideos !== null && nextVideoUrls.length > policy.maxVideos) {
      return NextResponse.json({ error: `Video limit reached (${policy.maxVideos} max).` }, { status: 403 })
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        photoUrls: nextPhotoUrls,
        videoUrls: nextVideoUrls,
      },
      update: {
        photoUrls: nextPhotoUrls,
        videoUrls: nextVideoUrls,
      },
      select: {
        photoUrls: true,
        videoUrls: true,
      },
    })

    return NextResponse.json({
      policy,
      counts: {
        photos: profile.photoUrls.length,
        videos: profile.videoUrls.length,
      },
      photoUrls: profile.photoUrls,
      videoUrls: profile.videoUrls,
    })
  } catch (error) {
    console.error('Failed to save member media:', error)
    return NextResponse.json({ error: 'Unable to save media.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const actorId = await getAuthenticatedUserId(request)

    if (!actorId) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { id: true, role: true },
    })

    if (!actor) {
      return NextResponse.json({ error: 'Actor not found.' }, { status: 404 })
    }

    const body = (await request.json().catch(() => null)) as
      | {
          kind?: MediaKind
          url?: string
          targetUserId?: string
        }
      | null

    if (!body || !body.url || (body.kind !== 'photo' && body.kind !== 'video')) {
      return NextResponse.json({ error: 'Valid media type and URL are required.' }, { status: 400 })
    }

    const targetUserId = body.targetUserId || actor.id

    if (targetUserId !== actor.id && actor.role !== 'ADMIN' && actor.role !== 'SUPREME_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: targetUserId },
      select: { id: true, photoUrls: true, videoUrls: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    const nextPhotos =
      body.kind === 'photo' ? profile.photoUrls.filter((u) => u !== body.url) : profile.photoUrls
    const nextVideos =
      body.kind === 'video' ? profile.videoUrls.filter((u) => u !== body.url) : profile.videoUrls

    await prisma.profile.update({
      where: { userId: targetUserId },
      data: {
        photoUrls: nextPhotos,
        videoUrls: nextVideos,
      },
    })

    if (actor.role === 'ADMIN' || actor.role === 'SUPREME_ADMIN') {
      await prisma.adminAuditLog.create({
        data: {
          actorUserId: actor.id,
          targetUserId: targetUserId !== actor.id ? targetUserId : null,
          action: 'MEDIA_DELETED',
          reason: `Removed ${body.kind}: ${body.url}`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      counts: {
        photos: nextPhotos.length,
        videos: nextVideos.length,
      },
      photoUrls: nextPhotos,
      videoUrls: nextVideos,
    })
  } catch (error) {
    console.error('Failed to delete media:', error)
    return NextResponse.json({ error: 'Unable to delete media.' }, { status: 500 })
  }
}
