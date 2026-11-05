import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

import { MESSAGES } from '@/lib/constants'
import { sendVerificationEmail } from '@/lib/email'
import prisma from '@/lib/prisma'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as { email?: string } | null
    const email = body?.email?.trim().toLowerCase()

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: MESSAGES.INVALID_EMAIL }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        displayName: true,
        username: true,
        emailVerified: true,
      },
    })

    // Do not reveal whether the account exists.
    if (!user || user.emailVerified) {
      return NextResponse.json({
        message: 'If that email needs verification, we sent a new link.',
      })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiresAt: expiresAt,
      },
    })

    const name = user.firstName || user.displayName || user.username
    await sendVerificationEmail(email, name, token)

    return NextResponse.json({
      message: 'If that email needs verification, we sent a new link.',
    })
  } catch (error) {
    console.error('[resend-verification]', error)
    return NextResponse.json({ error: MESSAGES.ERROR_GENERAL }, { status: 500 })
  }
}
