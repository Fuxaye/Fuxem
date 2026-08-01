import type { Metadata } from 'next'
import Link from 'next/link'

import LegalLinks from '@/app/_components/legal-links'
import { ROUTES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Contact | fuxem',
  description: 'Public contact and support information for fuxem, including privacy, safety, and moderation requests.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#05070f] px-4 py-10 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),transparent_44%),linear-gradient(140deg,rgba(15,19,29,0.92),rgba(9,12,20,0.95))] p-6 shadow-[0_24px_65px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Contact</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[0.04em] text-white sm:text-4xl">Contact fuxem</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">
            Use this page for general support, moderation questions, privacy requests, copyright notices, or compliance-related inquiries.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={ROUTES.PUBLIC_PREVIEW}
              className="rounded-full border border-cyan-200/35 bg-cyan-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-100 transition hover:bg-cyan-400/20"
            >
              Public Preview
            </Link>
            <Link
              href={ROUTES.HELP}
              className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]"
            >
              Help Center
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-100">Support & General Questions</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              For general questions, account issues, or platform support, email{' '}
              <a href="mailto:support@fuxem.xyz" className="text-cyan-200 underline decoration-cyan-200/40 underline-offset-4">
                support@fuxem.xyz
              </a>
              .
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-100">Privacy & Data Requests</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              Privacy requests and data-rights inquiries should be sent to{' '}
              <a href="mailto:privacy@fuxem.xyz" className="text-cyan-200 underline decoration-cyan-200/40 underline-offset-4">
                privacy@fuxem.xyz
              </a>
              .
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-100">Copyright & DMCA</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              Use{' '}
              <a href="mailto:dmca@fuxem.xyz" className="text-cyan-200 underline decoration-cyan-200/40 underline-offset-4">
                dmca@fuxem.xyz
              </a>{' '}
              for takedown requests and related notices.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-100">Compliance & Safety</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              Report suspected policy violations or compliance concerns to{' '}
              <a href="mailto:compliance@fuxem.xyz" className="text-cyan-200 underline decoration-cyan-200/40 underline-offset-4">
                compliance@fuxem.xyz
              </a>
              .
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Legal & policy links</p>
          <div className="mt-4">
            <LegalLinks className="text-xs uppercase tracking-[0.14em] text-stone-400" />
          </div>
        </section>
      </div>
    </main>
  )
}
