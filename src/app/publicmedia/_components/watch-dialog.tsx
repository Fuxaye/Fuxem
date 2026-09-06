'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

import type { PublicMediaVideo } from '@/lib/types'

import HostedVideoFrame from './hosted-video-frame'

type WatchDialogProps = {
  video: PublicMediaVideo | null
  onClose: () => void
}

export default function WatchDialog({ video, onClose }: WatchDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!video) return

    previousFocusRef.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const dialog = document.querySelector<HTMLElement>('[data-watch-dialog]')
      const focusable = dialog?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), video[controls]'
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
  }, [video])

  if (!video) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="presentation">
      <section
        data-watch-dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="watch-dialog-title"
        className="w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-card)] shadow-[0_28px_90px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal">Public viewing</p>
            <h2 id="watch-dialog-title" className="truncate text-lg font-semibold text-[var(--text-primary)]">
              {video.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close video viewer"
            className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="bg-black p-2 sm:p-4">
          <HostedVideoFrame video={video} dialog />
        </div>
        <div className="flex flex-col gap-1 border-t border-[var(--border-subtle)] px-4 py-3 text-sm sm:px-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Posted by {video.creator}</span>
          <span className="text-[var(--text-muted)]">Watching is public. Member interactions remain access-gated.</span>
        </div>
      </section>
    </div>
  )
}
