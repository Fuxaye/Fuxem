'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { LockKeyhole, X } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

import type { MemberAction } from './public-media-types'

type MemberAccessDialogProps = {
  open: boolean
  action: MemberAction | null
  returnTo: string
  onClose: () => void
}

export default function MemberAccessDialog({
  open,
  action,
  returnTo,
  onClose,
}: MemberAccessDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    previousFocusRef.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const dialog = document.querySelector<HTMLElement>('[data-member-access-dialog]')
      const focusable = dialog?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href]'
      )

      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [open])

  if (!open) return null

  const actionLabel = action === 'save' ? 'save videos' : 'react to member uploads'
  const loginHref = `${ROUTES.LOGIN}?returnTo=${encodeURIComponent(returnTo)}`
  const signupHref = `${ROUTES.SIGNUP}?returnTo=${encodeURIComponent(returnTo)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="presentation">
      <section
        data-member-access-dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-access-title"
        className="w-full max-w-md rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-card)] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-secondary">Members only</p>
              <h2 id="member-access-title" className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                Member access required
              </h2>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close member access dialog"
            className="rounded-full p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-5 text-base leading-6 text-[var(--text-muted)]">
          Watching is public. Sign in to {actionLabel}.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={loginHref} onClick={onClose} className={cn(buttonVariants(), 'min-h-11 flex-1')}>
            Sign in
          </Link>
          <Link
            href={signupHref}
            onClick={onClose}
            className={cn(buttonVariants({ variant: 'outline' }), 'min-h-11 flex-1')}
          >
            Create account
          </Link>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full text-center text-xs text-[var(--text-muted)] underline-offset-4 transition hover:text-[var(--text-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Continue watching
        </button>
      </section>
    </div>
  )
}
