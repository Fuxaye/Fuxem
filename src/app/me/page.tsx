import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

export default function MePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Your account</h1>
      <div className="mt-8 grid gap-3">
        <Link className="rounded border px-4 py-3" href={ROUTES.ME_PROFILE}>Profile</Link>
        <Link className="rounded border px-4 py-3" href={ROUTES.ME_MESSAGES}>Messages</Link>
        <Link className="rounded border px-4 py-3" href={ROUTES.ME_VIDEOS}>Videos</Link>
        <Link className="rounded border px-4 py-3" href={ROUTES.ME_SETTINGS}>Settings</Link>
      </div>
    </main>
  )
}
