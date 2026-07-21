'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { ROUTES } from '@/lib/constants'

const STORAGE_KEY = 'fuxem_cookie_consent'

type ConsentState = 'accepted' | 'declined' | null

export default function CookieConsent() {
  const [state, setState] = useState<ConsentState | 'loading'>('loading')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ConsentState | null
      setState(stored)
    } catch {
      setState(null)
    }
  }, [])

  function handleAccept() {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted')
    } catch {
      // localStorage unavailable
    }
    setState('accepted')
  }

  function handleDecline() {
    try {
      localStorage.setItem(STORAGE_KEY, 'declined')
    } catch {
      // localStorage unavailable
    }
    setState('declined')
  }

  // Not yet loaded or already decided
  if (state !== null) return null

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[9998] border-t border-white/10 bg-[#05070f]/95 px-4 py-4 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-xs leading-relaxed text-stone-400">
          We use essential cookies for authentication and optional advertising &amp; analytics
          cookies to help fund the platform. See our{' '}
          <Link href={ROUTES.LEGAL_PRIVACY} className="underline hover:text-stone-200">
            Privacy Policy
          </Link>{' '}
          for details.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={handleDecline}
            className="rounded-lg border border-white/15 px-4 py-2 text-xs text-stone-400 transition hover:border-white/30 hover:text-stone-200"
          >
            Essential only
          </button>
          <button
            onClick={handleAccept}
            className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-stone-200"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
