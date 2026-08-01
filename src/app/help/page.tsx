import Link from 'next/link'

import { ROUTES } from '@/lib/constants'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#05070f] px-4 py-10 text-stone-100 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-[0.08em] text-stone-100">Help Center</h1>
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.SIGNUP}
              className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]"
            >
              Sign Up
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="rounded-full border border-sky-300/30 bg-sky-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100 transition hover:bg-sky-300/20"
            >
              Log In
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-stone-300">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-100">Create Account</h2>
            <p className="mt-2">Use a valid email, a unique user ID, and a password with at least 8 characters.</p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-100">Verify And Log In</h2>
            <p className="mt-2">After registration, complete email verification when prompted, then log in with your user ID/email and password.</p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-100">Upload Profile Photos</h2>
            <p className="mt-2">
              Go to your profile and use Upload Photo. Supported image formats include JPG, PNG, WEBP, and GIF.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-100">Need Camera?</h2>
            <p className="mt-2">
              Use the Camera button on profile to open your cam room for private or public sessions.
            </p>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={ROUTES.PROFILE}
            className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]"
          >
            Go To Profile
          </Link>
          <Link
            href={ROUTES.CONTACT}
            className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-300 transition hover:border-white/35 hover:text-stone-100"
          >
            Contact
          </Link>
          <Link
            href={ROUTES.WELCOME}
            className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-300 transition hover:border-white/35 hover:text-stone-100"
          >
            Back To Welcome
          </Link>
        </div>
      </div>
    </div>
  )
}