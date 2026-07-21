import Link from 'next/link'
import { notFound } from 'next/navigation'

import BlockReportMenu from '@/app/_components/block-report-menu'
import prisma from '@/lib/prisma'

function formatRelativeSince(date: Date): string {
  const deltaMs = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (deltaMs < hour) {
    return 'Active recently'
  }
  if (deltaMs < day) {
    const hours = Math.max(1, Math.floor(deltaMs / hour))
    return `Active ${hours}h ago`
  }
  const days = Math.max(1, Math.floor(deltaMs / day))
  return `Active ${days}d ago`
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      username: true,
      displayName: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          bio: true,
          city: true,
          state: true,
          country: true,
          interests: true,
          lookingFor: true,
          avatarUrl: true,
          photoUrls: true,
          videoUrls: true,
          showOnlineStatus: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  const location = [user.profile?.city, user.profile?.state, user.profile?.country]
    .filter(Boolean)
    .join(', ')

  const joinedAt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(user.createdAt)

  const aboutText = user.profile?.bio?.trim() || 'This member has not added a bio yet.'
  const lookingFor = user.profile?.lookingFor || []
  const interests = user.profile?.interests || []
  const lastActiveText = user.profile?.showOnlineStatus ? formatRelativeSince(user.updatedAt) : 'Activity hidden'
  const mediaPreview = [
    ...(user.profile?.photoUrls || []).map((url) => ({ type: 'photo' as const, url })),
    ...(user.profile?.videoUrls || []).map((url) => ({ type: 'video' as const, url })),
  ].slice(0, 3)

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 text-stone-100 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full border border-white/20 bg-stone-800">
                {user.profile?.avatarUrl ? (
                  <img src={user.profile.avatarUrl} alt={`${user.displayName} avatar`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-stone-500">
                    {(user.displayName || user.username).slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Member Profile</p>
                <h1 className="mt-1 text-3xl font-semibold text-stone-100">{user.displayName}</h1>
                <p className="mt-1 text-sm text-stone-400">@{user.username}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/me/messages"
                className="rounded-lg border border-white/20 bg-white/[0.03] px-4 py-2 text-sm text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]"
              >
                Message
              </Link>
              <Link
                href={`/u/${user.username}/videos`}
                className="rounded-lg border border-white/20 bg-white/[0.03] px-4 py-2 text-sm text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]"
              >
                Videos
              </Link>
              <BlockReportMenu targetId={user.id} targetName={user.displayName || user.username} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm text-stone-300 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Location</span>
              <p className="mt-1 text-stone-200">{location || 'Not shared'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Member Since</span>
              <p className="mt-1 text-stone-200">{joinedAt}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Last Active</span>
              <p className="mt-1 text-stone-200">{lastActiveText}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">About</p>
            <p className="mt-2 text-sm leading-6 text-stone-200">{aboutText}</p>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Looking For</p>
            {lookingFor.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {lookingFor.slice(0, 8).map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1 text-xs text-amber-100"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-stone-400">No preferences shared yet.</p>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Interests</p>
            {interests.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {interests.slice(0, 12).map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-stone-200"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-stone-400">No interests added yet.</p>
            )}
          </section>
        </aside>
      </div>

      <section className="mt-6 rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Media Preview</p>
          <Link
            href={`/u/${user.username}/videos`}
            className="text-xs text-amber-200 transition hover:text-amber-100"
          >
            See all media
          </Link>
        </div>

        {mediaPreview.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {mediaPreview.map((item) => (
              <div key={`${item.type}-${item.url}`} className="overflow-hidden rounded-xl border border-white/10 bg-black/25">
                {item.type === 'photo' ? (
                  <img src={item.url} alt={`${user.displayName} media`} className="h-40 w-full object-cover" />
                ) : (
                  <video src={item.url} className="h-40 w-full object-cover" muted playsInline controls preload="metadata" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-stone-400">No public profile media yet.</p>
        )}
      </section>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-xs text-stone-400">
        Public profile information only. Sensitive account details stay private.
      </div>
    </main>
  )
}
