import Link from 'next/link'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'

import { AUTH_COOKIE_NAME, ROUTES } from '@/lib/constants'
import prisma from '@/lib/prisma'
import { isStaffRole } from '@/lib/staff-access'
import { getAdminToolsSections } from '@/lib/admin-tools'
import type { AuthTokenPayload } from '@/lib/types'

function getTokenPayload(token: string): AuthTokenPayload | null {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    return null
  }

  try {
    return jwt.verify(token, jwtSecret) as AuthTokenPayload
  } catch {
    return null
  }
}

export default async function AdminToolsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.ADMIN_TOOLS)}`)
  }

  const payload = getTokenPayload(token)
  const userId = payload?.userId || payload?.sub || null

  if (!userId) {
    redirect(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.ADMIN_TOOLS)}`)
  }

  const actor = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, username: true, displayName: true },
  })

  if (!actor || !isStaffRole(actor.role)) {
    redirect(ROUTES.ME)
  }

  const sections = getAdminToolsSections(actor.role)

  return (
    <main className="min-h-screen bg-[#090b10] px-4 pb-12 pt-8 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-2xl border border-white/15 bg-gradient-to-br from-[#141824] via-[#12151f] to-[#0c0f16] p-6 shadow-2xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Staff Tools</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Tools Hub</h1>
          <p className="mt-2 max-w-3xl text-sm text-stone-300">
            A focused landing surface for moderation and account operations with quick access to the core admin workflows.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={ROUTES.ADMIN}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-200 transition hover:bg-white/10"
            >
              Back to control panel
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="rounded-2xl border border-white/15 bg-black/30 p-5 shadow-xl backdrop-blur transition hover:border-cyan-400/30 hover:bg-white/8"
            >
              <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-300">{section.title}</p>
              <p className="mt-2 text-sm text-stone-200">{section.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
