import type { Metadata } from 'next'
import Link from 'next/link'

import LegalLinks from '@/app/_components/legal-links'
import { ROUTES } from '@/lib/constants'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Public Preview | fuxem',
  description:
    'Public, policy-safe preview area for fuxem including platform overview, trust and safety commitments, and optional featured public media.',
}

const SHOWCASE_ITEMS = [
  {
    title: 'Verified Adults Access',
    summary:
      'Members complete age and account checks before gaining full platform privileges.',
  },
  {
    title: 'Moderation And Reports',
    summary:
      'Flagged content is reviewed and staff actions are tracked through role-gated administration workflows.',
  },
  {
    title: 'Privacy-Centered Profiles',
    summary:
      'Members control profile visibility, social links, and media sharing preferences.',
  },
]

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value)
}

export default async function PublicPreviewPage() {
  const featuredVideos = await prisma.video.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
    select: {
      id: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      views: true,
      createdAt: true,
      user: {
        select: {
          displayName: true,
          username: true,
        },
      },
    },
  })

  return (
    <main className="min-h-screen bg-[#070b12] px-4 pb-14 pt-10 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),transparent_44%),linear-gradient(140deg,rgba(15,19,29,0.92),rgba(9,12,20,0.95))] p-6 shadow-[0_24px_65px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Public Preview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[0.04em] text-white sm:text-4xl">fuxem Platform Overview</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">
            This area provides a policy-safe preview surface for public visitors, partners, and compliance checks.
            Full member interaction and explicit media remain restricted behind account controls.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href={ROUTES.SIGNUP}
              className="rounded-full border border-cyan-200/35 bg-cyan-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-100 transition hover:bg-cyan-400/20"
            >
              Create Account
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]"
            >
              Member Login
            </Link>
            <Link
              href={ROUTES.HELP}
              className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-stone-300 transition hover:border-white/35 hover:text-stone-100"
            >
              Help Center
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {SHOWCASE_ITEMS.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-100">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-300">{item.summary}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Public Media Gallery</p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-100">Featured Public Uploads</h2>
            </div>
            <Link
              href={ROUTES.VIDEOS}
              className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]"
            >
              Open Full Gallery
            </Link>
          </div>

          {featuredVideos.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-5">
              <p className="text-sm text-stone-300">
                No public uploads yet. This section is ready and will auto-populate once verified members publish public media.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredVideos.map((video) => (
                <article key={video.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  <div className="h-40 w-full bg-black/35">
                    {video.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={video.thumbnailUrl}
                        alt={`${video.title} thumbnail`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-stone-500">
                        Preview Pending
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-4">
                    <h3 className="line-clamp-1 text-sm font-semibold text-stone-100">{video.title}</h3>
                    <p className="text-[11px] uppercase tracking-[0.13em] text-stone-400">
                      @{video.user.displayName || video.user.username} • {formatDate(video.createdAt)}
                    </p>
                    <p className="line-clamp-2 text-sm text-stone-300">{video.description || 'No description provided.'}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] uppercase tracking-[0.12em] text-stone-400">{video.views} views</span>
                      <Link
                        href={`${ROUTES.VIDEO_VIEWER}/${encodeURIComponent(video.id)}`}
                        className="rounded-lg border border-white/20 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Compliance</p>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            Adults only (18+). User-generated content is moderated with reporting and enforcement workflows.
            Platform policies and legal terms are available below.
          </p>
          <div className="mt-4">
            <LegalLinks className="text-xs uppercase tracking-[0.14em] text-stone-400" />
          </div>
        </section>
      </div>
    </main>
  )
}