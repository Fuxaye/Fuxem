import { NextRequest, NextResponse } from 'next/server'

import { MESSAGES } from '@/lib/constants'
import { getAuthenticatedUserId } from '@/lib/auth'
import prisma from '@/lib/prisma'

type AllowedStep = 'passcode' | 'interview' | 'completed'

function isAllowedStep(value: unknown): value is AllowedStep {
  return value === 'passcode' || value === 'interview' || value === 'completed'
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

    const body = (await request.json().catch(() => null)) as { onboardingStep?: unknown } | null

    if (!body || !isAllowedStep(body.onboardingStep)) {
      return NextResponse.json({ error: 'Invalid onboardingStep payload' }, { status: 400 })
    }

    const { memberId } = await params

    if (!memberId) {
      return NextResponse.json({ error: 'Member id is required' }, { status: 400 })
    }

    const target = await prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true, onboardingStep: true, username: true },
    })

    if (!target) {
      return NextResponse.json({ error: MESSAGES.FRIEND_REQUEST_INVALID_TARGET }, { status: 404 })
    }

    const oldStep = target.onboardingStep

    await prisma.user.update({
      where: { id: target.id },
      data: { onboardingStep: body.onboardingStep },
    })

    await prisma.adminAuditLog.create({
      data: {
        actorUserId: actor.id,
        targetUserId: target.id,
        action: 'MEMBER_ONBOARDING_RESET',
        reason: `onboardingStep ${oldStep} -> ${body.onboardingStep}`,
        beforeState: {
          onboardingStep: oldStep,
        },
        afterState: {
          onboardingStep: body.onboardingStep,
        },
      },
    })

    return NextResponse.json({
      message: `${target.username} onboarding step set to ${body.onboardingStep}`,
      user: {
        id: target.id,
        username: target.username,
        onboardingStep: body.onboardingStep,
      },
    })
  } catch (error) {
    console.error('Admin member onboarding update failed:', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
