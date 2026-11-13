'use client'

import { useEffect, useMemo, useState } from 'react'

import ComplianceFooter from '@/app/_components/compliance-footer'
import { Badge } from '@/components/ui/badge'
import type { PublicMediaVideo } from '@/lib/types'

import FeaturedDrop from './_components/featured-drop'
import MediaBrowseFilters, { type BrowseSort } from './_components/media-browse-filters'
import MediaStatePanel from './_components/media-state-panel'
import MemberAccessDialog from './_components/member-access-dialog'
import ProgramRail from './_components/program-rail'
import PublicScreeningHeader from './_components/public-screening-header'
import PublicVideoTile from './_components/public-video-tile'
import type { MemberAction, PublicMediaClientProps } from './_components/public-media-types'
import WatchDialog from './_components/watch-dialog'

function matchesSearch(video: PublicMediaVideo, search: string): boolean {
  const normalizedSearch = search.trim().toLowerCase()

  if (!normalizedSearch) return true

  return [video.title, video.creator, video.description || '', ...video.tags].some((value) =>
    value.toLowerCase().includes(normalizedSearch)
  )
}

function getReturnToPath(): string {
  if (typeof window === 'undefined') {
    return '/publicmedia'
  }

  return `${window.location.pathname}${window.location.search}`
}

export default function PublicMediaClient({
  videos,
  isAuthenticated,
  initialError,
}: PublicMediaClientProps) {
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState('all')
  const [sort, setSort] = useState<BrowseSort>('featured')
  const [selectedVideo, setSelectedVideo] = useState<PublicMediaVideo | null>(null)
  const [memberAction, setMemberAction] = useState<MemberAction | null>(null)
  const [memberNotice, setMemberNotice] = useState('')
  const [ageConfirmed, setAgeConfirmed] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      setAgeConfirmed(sessionStorage.getItem('fuxem_age_verified') === '1')
    } catch {
      setAgeConfirmed(false)
    }
  }, [])

  function confirmAge() {
    try {
      sessionStorage.setItem('fuxem_age_verified', '1')
    } catch {
      // The confirmation still applies for this visit.
    }
    setAgeConfirmed(true)
  }

  function declineAge() {
    window.location.href = 'https://www.google.com'
  }

  const tags = useMemo(() => {
    const uniqueTags = new Set(videos.flatMap((video) => video.tags))
    return ['all', ...Array.from(uniqueTags).sort((left, right) => left.localeCompare(right))]
  }, [videos])

  const gallery = useMemo(() => {
    const filtered = videos.filter((video) => {
      const matchesTag = tag === 'all' || video.tags.some((videoTag) => videoTag.toLowerCase() === tag.toLowerCase())
      return matchesTag && matchesSearch(video, search)
    })

    const featured = filtered[0] || null
    const remaining = filtered.slice(1)

    if (sort === 'title') {
      remaining.sort((left, right) => left.title.localeCompare(right.title))
    }

    return { featured, items: remaining, total: filtered.length }
  }, [videos, search, sort, tag])

  const hasFilters = Boolean(search.trim()) || tag !== 'all' || sort !== 'featured'

  function clearFilters() {
    setSearch('')
    setTag('all')
    setSort('featured')
  }

  function handleMemberAction(action: MemberAction) {
    setMemberNotice('')

    if (isAuthenticated) {
      setMemberNotice('Member interactions are not available yet.')
      return
    }

    setMemberAction(action)
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-4 pb-12 pt-3 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <PublicScreeningHeader />

        <div className="mt-10 lg:grid lg:grid-cols-[minmax(190px,0.28fr)_minmax(0,0.72fr)] lg:gap-8">
          <ProgramRail />
          <div className="min-w-0">
            <div className="mb-8 lg:hidden">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80">Public screening</p>
              <h1 className="mt-3 font-[family:var(--font-heading-family)] text-3xl leading-tight text-[var(--text-primary)]">
                Public uploads from verified Fuxem members.
              </h1>
              <p className="mt-3 text-base leading-6 text-[var(--text-muted)]">
                Watch freely; saves and reactions stay within member access.
              </p>
              <p className="mt-4 border-l border-secondary/50 pl-3 font-mono text-[10px] uppercase tracking-[0.14em] text-secondary">
                18+ only
              </p>
            </div>

            {ageConfirmed === null ? (
              <p className="text-sm text-[var(--text-muted)]">Confirm your age to view public uploads.</p>
            ) : ageConfirmed === false ? (
              <section className="rounded-2xl border border-white/10 bg-black/40 p-6 text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-secondary">Adults only</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">You must be over 18 to view this page</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--text-muted)]">
                  Public uploads are adult content. The legal links stay available below either way.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={confirmAge}
                    className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-stone-200"
                  >
                    I&apos;m over 18
                  </button>
                  <button
                    type="button"
                    onClick={declineAge}
                    className="rounded-lg border border-white/15 px-5 py-2.5 text-sm text-stone-300 transition hover:border-white/30 hover:text-stone-100"
                  >
                    I&apos;m under 18
                  </button>
                </div>
              </section>
            ) : initialError ? (
              <MediaStatePanel kind="error" message={initialError} />
            ) : videos.length === 0 ? (
              <MediaStatePanel kind="empty" />
            ) : gallery.featured ? (
              <FeaturedDrop
                video={gallery.featured}
                isAuthenticated={isAuthenticated}
                onWatch={setSelectedVideo}
                onMemberAction={handleMemberAction}
              />
            ) : null}
          </div>
        </div>

        {ageConfirmed && !initialError ? (
          <section className="mt-16 grid gap-8 lg:grid-cols-[minmax(190px,0.28fr)_minmax(0,0.72fr)] lg:gap-8" aria-labelledby="public-videos-heading">
            <MediaBrowseFilters
              search={search}
              tag={tag}
              sort={sort}
              tags={tags}
              onSearchChange={setSearch}
              onTagChange={setTag}
              onSortChange={setSort}
              onClear={clearFilters}
            />

            <div className="min-w-0">
              <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80">Screening index</p>
                  <h2 id="public-videos-heading" className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
                    All public videos
                  </h2>
                </div>
                <Badge variant="outline" className="border-teal/30 bg-teal/10 font-mono text-[10px] uppercase tracking-[0.12em] text-[#a6ffff]">
                  Verified-member uploads
                </Badge>
              </header>

              {memberNotice ? (
                <p role="status" className="mb-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-muted)]">
                  {memberNotice}
                </p>
              ) : null}

              {videos.length === 0 ? (
                <MediaStatePanel kind="empty" />
              ) : gallery.total === 0 ? (
                <MediaStatePanel
                  kind="no-match"
                  actionLabel="Clear filters"
                  onAction={clearFilters}
                />
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy={false}>
                  {gallery.items.map((video) => (
                    <PublicVideoTile
                      key={video.id}
                      video={video}
                      isAuthenticated={isAuthenticated}
                      onWatch={setSelectedVideo}
                      onMemberAction={handleMemberAction}
                    />
                  ))}
                </div>
              )}

              {hasFilters && gallery.total > 0 ? (
                <p className="mt-5 text-xs text-[var(--text-muted)]">
                  Showing filtered public uploads.
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        <ComplianceFooter />
      </div>

      <WatchDialog video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      <MemberAccessDialog
        open={memberAction !== null}
        action={memberAction}
        returnTo={getReturnToPath()}
        onClose={() => setMemberAction(null)}
      />
    </main>
  )
}
