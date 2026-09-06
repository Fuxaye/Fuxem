'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function PublicMediaError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4 text-[var(--text-primary)]">
      <section
        role="alert"
        className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.3)]"
      >
        <AlertTriangle className="mx-auto h-6 w-6 text-secondary" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold">Public videos could not be loaded</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          This preview could not be loaded here. Try again without changing your member access.
        </p>
        <Button type="button" onClick={reset} className="mt-5 gap-2">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      </section>
    </main>
  )
}
