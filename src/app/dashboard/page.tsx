import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
      <p className="text-sm uppercase tracking-wide text-neutral-500">Adults only</p>
      <h1 className="mt-2 text-5xl font-semibold">fuxem</h1>
      <p className="mt-4 max-w-xl text-neutral-600">
        A private member platform. Profiles, media, and messages stay behind login.
      </p>
      <div className="mt-8 flex gap-3">
        <Link className="rounded bg-black px-4 py-2 text-white" href={ROUTES.LOGIN}>Log in</Link>
        <Link className="rounded border px-4 py-2" href={ROUTES.SIGNUP}>Request access</Link>
      </div>
    </main>
  )
}
