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

    const body = (await request.json().catch(() => null)) as { isPremium?: unknown } | null

    if (!body || typeof body.isPremium !== 'boolean') {
      return NextResponse.json({ error: 'isPremium boolean is required' }, { status: 400 })
    }

    const { memberId } = await params

    if (!memberId) {
      return NextResponse.json({ error: 'Member id is required' }, { status: 400 })
    }

    const target = await prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true, isPremium: true, username: true },
    })

    if (!target) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_INVALID_TARGET }, { status: 404 })
    }

    const oldPremiumStatus = target.isPremium

    await prisma.user.update({
      where: { id: target.id },
      data: { isPremium: body.isPremium },
    })

    await prisma.adminAuditLog.create({
      data: {
        actorUserId: actor.id,
        targetUserId: target.id,
        action: 'MEMBER_PREMIUM_UPDATED',
        reason: `isPremium ${oldPremiumStatus} -> ${body.isPremium}`,
        beforeState: {
          isPremium: oldPremiumStatus,
        },
        afterState: {
          isPremium: body.isPremium,
        },
      },
    })

    const action = body.isPremium ? 'upgraded to Premium' : 'downgraded from Premium'
    return NextResponse.json({
      message: `${target.username} ${action}`,
      user: {
        id: target.id,
        username: target.username,
        isPremium: body.isPremium,
      },
    })
  } catch (error) {
    console.error('Admin member premium update failed:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
