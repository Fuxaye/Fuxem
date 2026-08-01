'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

import { MEMBER_MENU_ITEMS } from '@/lib/constants'

type TopQuickNavProps = {
  className?: string
}

function getActiveLabel(pathname: string): string {
  const match = MEMBER_MENU_ITEMS.find((item) => {
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  })
  return match?.label ?? MEMBER_MENU_ITEMS[0].label
}

export default function TopQuickNav({ className = '' }: TopQuickNavProps) {
  const pathname = usePathname()
  const safePathname = pathname ?? '/'
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const activeLabel = getActiveLabel(safePathname)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [safePathname])

  return (
    <div ref={ref} className={`fixed top-3 z-40 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-2xl border border-border-subtle bg-bg-surface/85 px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.34)] backdrop-blur-xl transition hover:border-border-strong hover:bg-bg-surface"
      >
        <span className="flex h-4 w-4 flex-col justify-between">
          <span className={`block h-px w-full bg-text-muted transition-all ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`block h-px w-full bg-text-muted transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-px w-full bg-text-muted transition-all ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </span>
        <span className="text-xs font-medium text-text-primary">{activeLabel}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-44 overflow-hidden rounded-2xl border border-border-subtle bg-bg-card/95 py-1 shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {MEMBER_MENU_ITEMS.map((item) => {
            const active = safePathname === item.href || safePathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 text-sm transition ${
                  active
                    ? 'bg-[#7C5CFC]/20 text-[#EDE9FF]'
                    : 'text-text-muted hover:bg-bg-surface hover:text-text-primary'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
