import { NextRequest, NextResponse } from 'next/server'

import { MESSAGES } from '@/lib/constants'
import { getAuthenticatedUserId } from '@/lib/auth'
import prisma from '@/lib/prisma'

type AllowedRole = 'MEMBER' | 'MODEL_VERIFIED' | 'ADMIN' | 'BURNER'

function isAllowedRole(value: unknown): value is AllowedRole {
  return (
    value === 'MEMBER' ||
    value === 'MODEL_VERIFIED' ||
    value === 'ADMIN' ||
    value === 'BURNER'
  )
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const actorId = await getAuthenticatedUserId(request)

    if (!actorId) {
      return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 })
    }

    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { id: true, role: true },
    })

    if (!actor || (actor.role !== 'ADMIN' && actor.role !== 'SUPREME_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = (await request.json().catch(() => null)) as { role?: unknown } | null

    if (!body || !isAllowedRole(body.role)) {
      return NextResponse.json({ error: 'Invalid role payload' }, { status: 400 })
    }

    const { memberId } = await params

    if (!memberId) {
      return NextResponse.json({ error: 'Member id is required' }, { status: 400 })
    }

    if (memberId === actor.id) {
      return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 })
    }

    const target = await prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true, role: true, username: true },
    })

    if (!target) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_INVALID_TARGET }, { status: 404 })
    }

    if (target.role === 'SUPREME_ADMIN' && actor.role !== 'SUPREME_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const oldRole = target.role

    await prisma.user.update({
      where: { id: target.id },
      data: { role: body.role },
    })

    await prisma.adminAuditLog.create({
      data: {
        actorUserId: actor.id,
        targetUserId: target.id,
        action: 'MEMBER_ROLE_UPDATED',
        reason: `role ${oldRole} -> ${body.role}`,
        beforeState: {
          role: oldRole,
        },
        afterState: {
          role: body.role,
        },
      },
    })

    return NextResponse.json({
      message: `${target.username} promoted to ${body.role}`,
      user: {
        id: target.id,
        username: target.username,
        role: body.role,
      },
    })
  } catch (error) {
    console.error('Admin member role update failed:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
