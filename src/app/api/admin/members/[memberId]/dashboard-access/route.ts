import { NextRequest, NextResponse } from 'next/server'

import { MESSAGES } from '@/lib/constants'
import { getAuthenticatedUserId } from '@/lib/auth'
import prisma from '@/lib/prisma'

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

    const body = (await request.json().catch(() => null)) as { canAccessDashboard?: unknown } | null

    if (!body || typeof body.canAccessDashboard !== 'boolean') {
      return NextResponse.json({ error: 'canAccessDashboard boolean is required' }, { status: 400 })
    }

    const { memberId } = await params

    if (!memberId) {
      return NextResponse.json({ error: 'Member id is required' }, { status: 400 })
    }

    if (memberId === actor.id) {
      return NextResponse.json({ error: 'You cannot change your own dashboard access' }, { status: 400 })
    }

    const target = await prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true, username: true, canAccessDashboard: true },
    })

    if (!target) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_INVALID_TARGET }, { status: 404 })
    }

    await prisma.user.update({
      where: { id: target.id },
      data: { canAccessDashboard: body.canAccessDashboard },
    })

    await prisma.adminAuditLog.create({
      data: {
        actorUserId: actor.id,
        targetUserId: target.id,
        action: 'MEMBER_DASHBOARD_ACCESS_UPDATED',
        reason: `canAccessDashboard ${target.canAccessDashboard} -> ${body.canAccessDashboard}`,
        beforeState: {
          canAccessDashboard: target.canAccessDashboard,
        },
        afterState: {
          canAccessDashboard: body.canAccessDashboard,
        },
      },
    })

    return NextResponse.json({
      message: `${target.username} dashboard access ${body.canAccessDashboard ? 'granted' : 'revoked'}`,
      user: {
        id: target.id,
        username: target.username,
        canAccessDashboard: body.canAccessDashboard,
      },
    })
  } catch (error) {
    console.error('Admin dashboard access update failed:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}