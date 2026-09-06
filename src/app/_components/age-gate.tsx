'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ROUTES } from '@/lib/constants'

const STORAGE_KEY = 'fuxem_age_verified'
const PENDING_PUBLIC_ACCESS_KEY = 'fuxem_pending_public_access'
const AGE_GATED_ACCESS_CODES = new Set(['8888', '9999', '3333'])

export default function AgeGate() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const verified = sessionStorage.getItem(STORAGE_KEY)
    const pendingAccess = sessionStorage.getItem(PENDING_PUBLIC_ACCESS_KEY)

    if (AGE_GATED_ACCESS_CODES.has(pendingAccess || '') && !verified) {
      setShow(true)
      return
    }

    setShow(false)
  }, [pathname])

  function handleAccept() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
      sessionStorage.removeItem(PENDING_PUBLIC_ACCESS_KEY)
    } catch {
      // sessionStorage unavailable — hide anyway for this render
    }
    setShow(false)
  }

  function handleDecline() {
    try {
      sessionStorage.removeItem(PENDING_PUBLIC_ACCESS_KEY)
    } catch {
      // ignore storage errors
    }
    window.location.href = 'https://www.google.com'
  }

  if (!show) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 px-4"
    >
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#05070f] p-8 text-center shadow-2xl">
        <p className="mb-1 text-xs uppercase tracking-[0.18em] text-stone-500">Adults only</p>
        <h1
          id="age-gate-title"
          className="mb-4 text-2xl font-semibold tracking-tight text-white"
        >
          You must be 18 or older to enter
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-stone-400">
          This site contains sexually explicit adult content intended solely for consenting adults.
          By entering, you confirm you are at least 18 years of age (or the age of majority in your
          jurisdiction) and that viewing adult content is legal where you are located.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleAccept}
            className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            I am 18 or older — Enter
          </button>
          <button
            onClick={handleDecline}
            className="rounded-lg border border-white/15 px-6 py-2.5 text-sm text-stone-400 transition hover:border-white/30 hover:text-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
          >
            I am under 18 — Leave
          </button>
        </div>
        <p className="mt-5 text-[11px] leading-relaxed text-stone-600">
          By entering, you also agree to our{' '}
          <Link href={ROUTES.LEGAL_TERMS} className="underline hover:text-stone-400">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href={ROUTES.LEGAL_PRIVACY} className="underline hover:text-stone-400">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
