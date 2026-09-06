import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { MESSAGES } from '@/lib/constants'
import prisma from '@/lib/prisma'
import { isEligiblePublicVideo } from '@/lib/public-video-policy'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const requesterId = await getAuthenticatedUserId(request)

    const existing = await prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        isPublic: true,
        user: {
          select: {
            role: true,
            status: true,
          },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: MESSAGES.VIDEO_NOT_FOUND }, { status: 404 })
    }

    if (!isEligiblePublicVideo(existing) && requesterId !== existing.userId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const updated = await prisma.video.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        views: true,
      },
    })

    return NextResponse.json({ views: updated.views })
  } catch (error) {
    console.error('Failed to increment video views:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
