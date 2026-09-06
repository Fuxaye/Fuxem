'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'

import MemberLayout from '@/app/_layouts/member-layout'
import { fetchMemberProfile } from '@/lib/api'
import { ROUTES } from '@/lib/constants'
import type { MemberProfileResponse } from '@/lib/types'

function getInitials(value: string) {
  return value
    .split(' ')
    .map((part) => part.trim().slice(0, 1))
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function ViewProfileContent() {
  const [data, setData] = useState<MemberProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const response = await fetchMemberProfile()

        if (!mounted) {
          return
        }

        setData(response)
      } catch (err) {
        if (!mounted) {
          return
        }

        setError(err instanceof Error ? err.message : 'Unable to load your profile view.')
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  const sidebarDisplayName = useMemo(() => {
    if (!data) {
      return 'Member'
    }

    return data.user.displayName || data.user.username || 'Member'
  }, [data])

  const mediaPreview = useMemo(() => {
    if (!data) {
      return []
    }

    return [
      ...data.profile.photoUrls.map((url) => ({ type: 'photo' as const, url })),
      ...data.profile.videoUrls.map((url) => ({ type: 'video' as const, url })),
    ].slice(0, 6)
  }, [data])

  return (
    <MemberLayout
      initialUser={{
        username: data?.user.username || 'member',
        firstName: sidebarDisplayName,
        displayName: sidebarDisplayName,
        avatarUrl: data?.profile.avatarUrl || undefined,
        profileHref: ROUTES.PROFILE_VIEW,
      }}
    >
      <div className="mx-auto max-w-6xl space-y-6 px-4 pb-8 pt-8 text-stone-100 sm:px-6 lg:px-8 profile-sexy-font">
        <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">Profile workspace</p>
              <h1 className="mt-2 text-2xl font-semibold text-stone-100">View My Profile</h1>
              <p className="mt-2 max-w-2xl text-sm text-stone-400">
                This page is the read-only member-facing profile surface. Use the separate editor when you want to change content.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={ROUTES.PROFILE}
                className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 transition hover:border-white/30 hover:bg-white/[0.08]"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400">Separate page</p>
                <p className="mt-1 text-sm font-semibold text-stone-100">Edit my profile</p>
                <p className="mt-1 text-xs text-stone-400">Go back to forms, fields, and media management.</p>
              </Link>
              <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/80">Current mode</p>
                <p className="mt-1 text-sm font-semibold text-emerald-100">View my profile</p>
                <p className="mt-1 text-xs text-emerald-100/70">Read-only presentation without edit controls.</p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur-xl">
            <p className="text-sm text-stone-400">Loading your profile view...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-400/25 bg-rose-500/10 p-6 text-rose-200">
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : data ? (
          <>
            <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
              <section className="rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-sm sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-full border border-white/20 bg-stone-800">
                      {data.profile.avatarUrl ? (
                        <img src={data.profile.avatarUrl} alt={`${sidebarDisplayName} avatar`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-stone-500">
                          {getInitials(sidebarDisplayName || data.user.username)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Member profile</p>
                      <h2 className="mt-1 text-3xl font-semibold text-stone-100">{sidebarDisplayName}</h2>
                      <p className="mt-1 text-sm text-stone-400">@{data.user.username}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500">Viewing mode</p>
                    <p className="mt-1 text-sm font-semibold text-stone-100">Public-style presentation</p>
                    <p className="mt-1 text-xs text-stone-400">No fields, toggles, or save actions here.</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-stone-300 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Location</span>
                    <p className="mt-1 text-stone-200">{[data.profile.city, data.profile.state, data.profile.country].filter(Boolean).join(', ') || 'Not shared'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Gender</span>
                    <p className="mt-1 text-stone-200">{data.profile.gender || 'Not shared'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Orientation</span>
                    <p className="mt-1 text-stone-200">{data.profile.sexualOrientation || 'Not shared'}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">About</p>
                  <p className="mt-2 text-sm leading-6 text-stone-200">
                    {data.profile.bio?.trim() || 'You have not written a bio yet.'}
                  </p>
                </div>
              </section>

              <aside className="space-y-6">
                <section className="rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Looking for</p>
                  {data.profile.lookingFor.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {data.profile.lookingFor.map((item) => (
                        <span key={item} className="rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-stone-400">No looking-for tags added yet.</p>
                  )}
                </section>

                <section className="rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Interests</p>
                  {data.profile.interests.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {data.profile.interests.map((interest) => (
                        <span key={interest} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-stone-200">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-stone-400">No interests added yet.</p>
                  )}
                </section>

                <section className="rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Curious / Might Try</p>
                  {data.profile.kinks.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {data.profile.kinks.map((item) => (
                        <span key={item} className="rounded-full border border-fuchsia-300/35 bg-fuchsia-400/10 px-3 py-1 text-xs text-fuchsia-100">
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-stone-400">No curious tags added yet.</p>
                  )}
                </section>
              </aside>
            </div>

            <section className="rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Media preview</p>
                <Link href={ROUTES.PROFILE} className="text-xs text-amber-200 transition hover:text-amber-100">
                  Edit profile media
                </Link>
              </div>

              {mediaPreview.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {mediaPreview.map((item) => (
                    <div key={`${item.type}-${item.url}`} className="overflow-hidden rounded-xl border border-white/10 bg-black/25">
                      {item.type === 'photo' ? (
                        <img src={item.url} alt={`${sidebarDisplayName} media`} className="h-48 w-full object-cover" />
                      ) : (
                        <video src={item.url} className="h-48 w-full object-cover" muted playsInline controls preload="metadata" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-stone-400">No public profile media yet.</p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </MemberLayout>
  )
}

export default function ProfileViewPage() {
  return (
    <Suspense fallback={null}>
      <ViewProfileContent />
    </Suspense>
  )
}