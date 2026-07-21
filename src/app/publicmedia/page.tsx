import type { Metadata } from 'next'
import Link from 'next/link'

import LegalLinks from '@/app/_components/legal-links'
import { PUBLIC_MEDIA_VIDEOS } from '@/content/publicmedia/videos'
import { ROUTES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Public Media | fuxem',
  description:
    'Public media showcase for compliance and ad network review. Stream-ready cards for Bunny links.',
}

export default function PublicMediaPage() {
  return (
    <main className="min-h-screen bg-[#070b12] px-4 pb-14 pt-10 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-7">
        <header className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),transparent_44%),linear-gradient(140deg,rgba(15,19,29,0.92),rgba(9,12,20,0.95))] p-6 shadow-[0_24px_65px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Public Media</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[0.04em] text-white sm:text-4xl">Compliance Video Gallery</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">
            This page is intentionally public. Replace the placeholder stream links in
            <span className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-xs text-stone-200">src/content/publicmedia/videos.ts</span>
            with Bunny embeds to publish streamable preview content quickly.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href={ROUTES.PUBLIC_PREVIEW}
              className="rounded-full border border-cyan-200/35 bg-cyan-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-100 transition hover:bg-cyan-400/20"
            >
              Platform Preview
            </Link>
            <Link
              href={ROUTES.SIGNUP}
              className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]"
            >
              Create Account
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {PUBLIC_MEDIA_VIDEOS.map((video) => (
            <article key={video.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl">
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={video.streamUrl}
                  title={video.title}
                  loading="lazy"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>

              <div className="space-y-3 p-4">
                <div>
                  <h2 className="text-lg font-semibold text-stone-100">{video.title}</h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-400">{video.creator}</p>
                </div>

                <p className="text-sm leading-6 text-stone-300">{video.summary}</p>

                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <span
                      key={`${video.id}-${tag}`}
                      className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-stone-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Compliance</p>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            Adults only (18+). Public gallery is policy-safe and intended for review surfaces.
            Full member interactions remain behind authentication.
          </p>
          <div className="mt-4">
            <LegalLinks className="text-xs uppercase tracking-[0.14em] text-stone-400" />
          </div>
        </section>
      </div>
    </main>
  )
}
