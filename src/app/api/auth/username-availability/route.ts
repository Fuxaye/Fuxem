import { NextRequest, NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { USERNAME_REGEX } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username')?.trim().toLowerCase() ?? ''

  if (!USERNAME_REGEX.test(username)) {
    return NextResponse.json({ error: 'Enter a valid User ID' }, { status: 400 })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })

    return NextResponse.json(
      { available: !existingUser },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('[username-availability]', error)
    return NextResponse.json({ error: 'Unable to check User ID availability' }, { status: 500 })
  }
}