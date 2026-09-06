import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function PublicScreeningHeader() {
  return (
    <header className="flex min-h-14 items-center justify-between gap-4 border-b border-[var(--border-subtle)] py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={ROUTES.WELCOME}
          className="font-[family:var(--font-heading-family)] text-base tracking-[0.12em] text-[var(--text-primary)] transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
          aria-label="Fuxem home"
        >
          fuxem
        </Link>
        <span className="h-4 w-px bg-[var(--border-subtle)]" aria-hidden="true" />
        <span className="truncate font-mono text-[11px] uppercase tracking-[0.16em] text-primary/90">
          Public screening
        </span>
      </div>

      <nav aria-label="Public media account actions" className="flex shrink-0 items-center gap-3">
        <Link
          href={ROUTES.LOGIN}
          className="text-xs font-medium text-[var(--text-muted)] underline-offset-4 transition hover:text-[var(--text-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
        >
          Sign in
        </Link>
        <Link
          href={ROUTES.SIGNUP}
          className={cn(buttonVariants({ size: 'sm' }), 'hidden min-h-9 px-3 text-xs sm:inline-flex')}
        >
          Create account
        </Link>
      </nav>
    </header>
  )
}
