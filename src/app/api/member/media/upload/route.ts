import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { MAX_PROFILE_PHOTO_BYTES, MESSAGES } from '@/lib/constants'
import { getMemberMediaPolicy } from '@/lib/member-media-policy'
import prisma from '@/lib/prisma'
import { uploadToBunnyStorage } from '@/lib/storage/bunny'

const MAX_PROFILE_VIDEO_BYTES = 100 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])

type UploadKind = 'photo' | 'video'

function parseUploadKind(value: FormDataEntryValue | null): UploadKind | null {
  if (typeof value !== 'string') {
    return null
  }

  return value === 'photo' || value === 'video' ? value : null
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const formData = await request.formData()
    const kind = parseUploadKind(formData.get('kind'))
    const file = formData.get('file')

    if (!kind) {
      return NextResponse.json({ error: 'Invalid upload kind.' }, { status: 400 })
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'A file is required.' }, { status: 400 })
    }

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
      return NextResponse.json({ error: MESSAGES.LOGIN_INVALID }, { status: 404 })
    }

    const policy = getMemberMediaPolicy({ role: user.role, isPremium: user.isPremium })

    if (kind === 'video' && !policy.allowVideos) {
      return NextResponse.json({ error: 'Your account cannot upload videos.' }, { status: 403 })
    }

    const isValidImage = ALLOWED_IMAGE_TYPES.has(file.type)
    const isValidVideo = ALLOWED_VIDEO_TYPES.has(file.type)

    if (kind === 'photo' && !isValidImage) {
      return NextResponse.json({ error: 'Unsupported image type.' }, { status: 400 })
    }

    if (kind === 'video' && !isValidVideo) {
      return NextResponse.json({ error: 'Unsupported video type.' }, { status: 400 })
    }

    if (kind === 'photo' && file.size > MAX_PROFILE_PHOTO_BYTES) {
      return NextResponse.json({ error: `Photo exceeds ${Math.floor(MAX_PROFILE_PHOTO_BYTES / (1024 * 1024))}MB limit.` }, { status: 400 })
    }

    if (kind === 'video' && file.size > MAX_PROFILE_VIDEO_BYTES) {
      return NextResponse.json({ error: `Video exceeds ${Math.floor(MAX_PROFILE_VIDEO_BYTES / (1024 * 1024))}MB limit.` }, { status: 400 })
    }

    const existingPhotoUrls = user.profile?.photoUrls || []
    const existingVideoUrls = user.profile?.videoUrls || []

    if (kind === 'photo' && policy.maxPhotos !== null && existingPhotoUrls.length >= policy.maxPhotos) {
      return NextResponse.json({ error: `Photo limit reached (${policy.maxPhotos} max).` }, { status: 403 })
    }

    if (kind === 'video' && policy.maxVideos !== null && existingVideoUrls.length >= policy.maxVideos) {
      return NextResponse.json({ error: `Video limit reached (${policy.maxVideos} max).` }, { status: 403 })
    }

    const uploaded = await uploadToBunnyStorage({ file, userId, kind })
    const nextPhotoUrls =
      kind === 'photo'
        ? Array.from(new Set([uploaded.url, ...existingPhotoUrls]))
        : existingPhotoUrls

    const nextVideoUrls =
      kind === 'video'
        ? Array.from(new Set([uploaded.url, ...existingVideoUrls]))
        : existingVideoUrls

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
      kind,
      url: uploaded.url,
      contentType: uploaded.contentType,
      size: uploaded.size,
      counts: {
        photos: profile.photoUrls.length,
        videos: profile.videoUrls.length,
      },
      photoUrls: profile.photoUrls,
      videoUrls: profile.videoUrls,
    })
  } catch (error) {
    console.error('Member media upload failed:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
