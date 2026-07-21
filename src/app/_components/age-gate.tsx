'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { ROUTES } from '@/lib/constants'

const STORAGE_KEY = 'fuxem_age_verified'

export default function AgeGate() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      const verified = sessionStorage.getItem(STORAGE_KEY)
      if (!verified) setShow(true)
    } catch {
      setShow(true)
    }
  }, [])

  function handleAccept() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // sessionStorage unavailable — hide anyway for this render
    }
    setShow(false)
  }

  function handleDecline() {
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
