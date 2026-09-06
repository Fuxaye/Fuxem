import { NextRequest, NextResponse } from 'next/server'

import { MESSAGES } from '@/lib/constants'
import { getAuthenticatedUserId } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isStaffRole } from '@/lib/staff-access'

type VerificationPayload = {
  emailVerified?: unknown
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

    if (!actor || !isStaffRole(actor.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = (await request.json().catch(() => null)) as VerificationPayload | null

    if (!body || typeof body.emailVerified !== 'boolean') {
      return NextResponse.json({ error: 'Invalid verification payload' }, { status: 400 })
    }

    const { memberId } = await params

    if (!memberId) {
      return NextResponse.json({ error: 'Member id is required' }, { status: 400 })
    }

    const target = await prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true, role: true, emailVerified: true },
    })

    if (!target) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_INVALID_TARGET }, { status: 404 })
    }

    if (target.role === 'SUPREME_ADMIN' && actor.role !== 'SUPREME_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.user.update({
      where: { id: target.id },
      data: { emailVerified: body.emailVerified },
    })

    await prisma.adminAuditLog.create({
      data: {
        actorUserId: actor.id,
        targetUserId: target.id,
        action: 'MEMBER_EMAIL_VERIFICATION_UPDATED',
        reason: `emailVerified -> ${body.emailVerified}`,
        beforeState: {
          emailVerified: target.emailVerified,
        },
        afterState: {
          emailVerified: body.emailVerified,
        },
      },
    })

    return NextResponse.json({
      message: body.emailVerified ? 'Member email verified' : 'Member email unverified',
      emailVerified: body.emailVerified,
    })
  } catch (error) {
    console.error('Admin member verification update failed:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
