import Link from 'next/link'
import { notFound } from 'next/navigation'

import prisma from '@/lib/prisma'

export default async function UserPicturesPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      username: true,
      displayName: true,
      profile: {
        select: {
          photoUrls: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  const photos = user.profile?.photoUrls || []

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 text-slate-100">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pictures</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-100">
            {user.displayName} (@{user.username})
          </h1>
        </div>
        <Link href={`/u/${user.username}`} className="text-sm text-slate-300 hover:text-slate-100">
          Back to profile
        </Link>
      </div>

      {photos.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-sm text-slate-300">
          No pictures yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((url) => (
            <img
              key={url}
              src={url}
              alt={`${user.displayName} picture`}
              className="aspect-square w-full rounded-xl border border-white/10 object-cover"
            />
          ))}
        </div>
      )}
    </main>
  )
}
