import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUserId } from '@/lib/auth'
import { MESSAGES } from '@/lib/constants'
import prisma from '@/lib/prisma'

function parseTargetId(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return null
  }

  const targetId = (body as { targetId?: unknown }).targetId
  if (typeof targetId !== 'string') {
    return null
  }

  const value = targetId.trim()
  return value.length > 0 ? value : null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const blockedRows = await prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: 'blocked',
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        recipientId: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        blocked: blockedRows.map((row) => ({
          blockedId: row.recipientId,
          createdAt: row.createdAt.toISOString(),
        })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to fetch block list:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const body = (await request.json().catch(() => null)) as unknown
    const targetId = parseTargetId(body)

    if (!targetId) {
      return NextResponse.json({ error: MESSAGES.FIELD_REQUIRED }, { status: 400 })
    }

    if (targetId === userId) {
      return NextResponse.json({ error: 'You cannot block yourself' }, { status: 400 })
    }

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true },
    })

    if (!target) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_INVALID_TARGET }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.friendship.findFirst({
        where: {
          requesterId: userId,
          recipientId: targetId,
        },
        select: { id: true },
      })

      if (existing) {
        await tx.friendship.update({
          where: { id: existing.id },
          data: { status: 'blocked' },
        })
      } else {
        await tx.friendship.create({
          data: {
            requesterId: userId,
            recipientId: targetId,
            status: 'blocked',
          },
        })
      }

      await tx.friendship.updateMany({
        where: {
          requesterId: targetId,
          recipientId: userId,
          status: { in: ['pending', 'accepted'] },
        },
        data: { status: 'declined' },
      })
    })

    return NextResponse.json({ message: 'Member blocked' }, { status: 200 })
  } catch (error) {
    console.error('Failed to block member:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const body = (await request.json().catch(() => null)) as unknown
    const targetId = parseTargetId(body)

    if (!targetId) {
      return NextResponse.json({ error: MESSAGES.FIELD_REQUIRED }, { status: 400 })
    }

    await prisma.friendship.updateMany({
      where: {
        requesterId: userId,
        recipientId: targetId,
        status: 'blocked',
      },
      data: { status: 'declined' },
    })

    return NextResponse.json({ message: 'Member unblocked' }, { status: 200 })
  } catch (error) {
    console.error('Failed to unblock member:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
