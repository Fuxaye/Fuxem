import { NextResponse } from 'next/server'

import { MESSAGES } from '@/lib/constants'
import prisma from '@/lib/prisma'

export async function assertEmailVerifiedForMedia(userId: string): Promise<NextResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  })

  if (!user?.emailVerified) {
    return NextResponse.json({ error: MESSAGES.EMAIL_VERIFICATION_REQUIRED }, { status: 403 })
  }

  return null
}
