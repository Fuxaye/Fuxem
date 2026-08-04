'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import LegalLinks from '@/app/_components/legal-links'
import { PUBLIC_MEDIA_SOURCE_PAYLOAD } from '@/content/publicmedia/source'
import { ROUTES } from '@/lib/constants'
import { loadPublicMediaSourceItems, normalizePublicMediaItems } from '@/lib/public-media-source'
import { getPublicMediaDisplayState, getPublicMediaGallery } from '@/lib/public-media'

export default function PublicMediaClient() {
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState('all')
  const [sort, setSort] = useState<'featured' | 'title'>('featured')

  const mediaItems = useMemo(() => normalizePublicMediaItems(loadPublicMediaSourceItems(PUBLIC_MEDIA_SOURCE_PAYLOAD)), [])
  const gallery = useMemo(() => getPublicMediaGallery(mediaItems, { search, tag, sort }), [mediaItems, search, tag, sort])

  const tags = useMemo(() => {
    const uniqueTags = Array.from(new Set(mediaItems.flatMap((video) => video.tags)))
    return ['all', ...uniqueTags.sort((left, right) => left.localeCompare(right))]
  }, [mediaItems])

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

        <section className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Discover</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Browse the latest public teasers</h2>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-stone-300">
                <span className="uppercase tracking-[0.14em] text-stone-400">Search</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Find a clip"
                  className="bg-transparent text-sm text-stone-100 outline-none"
                />
              </label>
              <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-stone-300">
                <span className="uppercase tracking-[0.14em] text-stone-400">Tag</span>
                <select
                  value={tag}
                  onChange={(event) => setTag(event.target.value)}
                  className="bg-transparent text-sm text-stone-100 outline-none"
                >
                  {tags.map((option) => (
                    <option key={option} value={option} className="bg-[#090b10] text-stone-100">
                      {option === 'all' ? 'All' : option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-stone-300">
                <span className="uppercase tracking-[0.14em] text-stone-400">Sort</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as 'featured' | 'title')}
                  className="bg-transparent text-sm text-stone-100 outline-none"
                >
                  <option value="featured" className="bg-[#090b10] text-stone-100">Featured</option>
                  <option value="title" className="bg-[#090b10] text-stone-100">Title</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        {gallery.featured ? (
          <section className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/12 via-black/25 to-black/40 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="aspect-video w-full bg-black">
                {(() => {
                  const displayState = getPublicMediaDisplayState(gallery.featured)

                  if (displayState.kind === 'placeholder') {
                    return (
                      <div className="flex h-full w-full items-center justify-center border border-dashed border-white/15 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),transparent_50%),linear-gradient(140deg,rgba(15,19,29,0.92),rgba(9,12,20,0.95))] p-6 text-center">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300">Preview pending</p>
                          <p className="mt-2 text-sm text-stone-300">{displayState.fallbackLabel}</p>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <iframe
                      src={displayState.src}
                      title={gallery.featured.title}
                      loading="lazy"
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  )
                })()}
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300">Featured Preview</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{gallery.featured.title}</h3>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-stone-400">{gallery.featured.creator}</p>
                <p className="mt-4 text-sm leading-7 text-stone-300">{gallery.featured.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {gallery.featured.tags.map((tag) => (
                    <span
                      key={`${gallery.featured?.id}-${tag}`}
                      className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {gallery.items.map((video) => (
            <article key={video.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl">
              <div className="aspect-video w-full bg-black">
                {(() => {
                  const displayState = getPublicMediaDisplayState(video)

                  if (displayState.kind === 'placeholder') {
                    return (
                      <div className="flex h-full w-full items-center justify-center border border-dashed border-white/15 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),transparent_50%),linear-gradient(140deg,rgba(15,19,29,0.92),rgba(9,12,20,0.95))] p-6 text-center">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300">Preview pending</p>
                          <p className="mt-2 text-sm text-stone-300">{displayState.fallbackLabel}</p>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <iframe
                      src={displayState.src}
                      title={video.title}
                      loading="lazy"
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  )
                })()}
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