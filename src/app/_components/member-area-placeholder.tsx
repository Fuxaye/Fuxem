import Link from 'next/link'

import TopQuickNav from '@/app/_components/top-quick-nav'
import { ROUTES } from '@/lib/constants'

type MemberAreaPlaceholderProps = {
  eyebrow: string
  title: string
  description: string
  highlights: string[]
}

export default function MemberAreaPlaceholder({
  eyebrow,
  title,
  description,
  highlights,
}: MemberAreaPlaceholderProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-base px-4 pb-8 pt-24 text-text-primary sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-28"
        style={{ backgroundImage: "url('/welcome2.jpg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(124,92,252,0.16),transparent_44%),linear-gradient(180deg,rgba(13,12,20,0.7)_0%,rgba(13,12,20,0.86)_100%)]" />

      <TopQuickNav className="left-4 right-4 md:left-6 md:right-6" />

      <main className="relative z-10 mx-auto max-w-5xl space-y-6">
        <div className="ui-shell-panel p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">{eyebrow}</p>
          <h1 className="mt-3 font-[family:var(--font-heading)] text-4xl text-text-primary sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#c8c2e7] sm:text-base">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={ROUTES.DASHBOARD}
              className="ui-button-primary px-4 py-2 text-sm font-semibold"
            >
              Back to dashboard
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="ui-button-secondary px-4 py-2 text-sm"
            >
              Switch account
            </Link>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item}
              className="ui-card p-5 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Planned</p>
              <p className="mt-3 text-sm font-semibold text-text-primary">{item}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-dashed border-border-strong bg-bg-card/60 p-6 backdrop-blur-xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Status</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#c8c2e7] sm:text-base">
            This page is intentionally live as a protected placeholder so member navigation works end to end while the real feature is being built.
          </p>
        </section>
      </main>
    </div>
  )
}