import Link from 'next/link'

import LegalLinks from '@/app/_components/legal-links'
import { ROUTES } from '@/lib/constants'
import type { LegalDocument } from '@/lib/legal-content'

type LegalPageShellProps = {
  document: LegalDocument
}

export default function LegalPageShell({ document }: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-[#05070f] px-4 py-10 text-stone-100 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">Legal</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[0.06em] text-stone-100">{document.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">{document.intro}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              Effective Date: {document.effectiveDate}
            </p>
          </div>

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
          {document.sections.map((section) => (
            <section key={section.heading} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-100">{section.heading}</h2>
              <div className="mt-2 space-y-2">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {document.closingNote ? (
          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100/90">
            {document.closingNote}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <Link
            href={ROUTES.HELP}
            className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-300 transition hover:border-white/35 hover:text-stone-100"
          >
            Help Center
          </Link>
          <LegalLinks className="text-xs uppercase tracking-[0.14em] text-stone-400" />
        </div>
      </div>
    </div>
  )
}