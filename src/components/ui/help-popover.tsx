'use client'

import { useEffect, useRef, useState } from 'react'

type HelpPopoverProps = {
  title: string
  body: string
  className?: string
}

export function HelpPopover({ title, body, className = '' }: HelpPopoverProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  return (
    <span ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-label={`Help: ${title}`}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-sky-200/45 bg-sky-300/12 text-[11px] font-bold text-sky-100 transition hover:bg-sky-300/20"
      >
        ?
      </button>
      {open && (
        <span
          role="dialog"
          aria-label={`${title} help`}
          className="absolute right-0 top-7 z-50 w-64 rounded-xl border border-white/10 bg-slate-950/95 p-3 text-left shadow-[0_18px_35px_rgba(0,0,0,0.5)]"
        >
          <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-200">
            {title}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-slate-200">{body}</span>
        </span>
      )}
    </span>
  )
}