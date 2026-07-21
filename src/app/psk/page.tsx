'use client'

import { Suspense } from 'react'
import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { MESSAGES, ROUTES } from '@/lib/constants'

const CP = "Copperplate, 'Copperplate Gothic Light', fantasy"

function PskContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || ROUTES.DASHBOARD

  const [psk, setPsk] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!psk.trim()) {
      setError('Enter PSK')
      return
    }

    setStatus('loading')
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode: '3333',
          psk: psk.trim(),
          returnTo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || MESSAGES.LOGIN_INVALID)
        setStatus('idle')
        return
      }

      router.push(data.returnTo || ROUTES.DASHBOARD)
    } catch {
      setError('Network error. Please try again.')
      setStatus('idle')
    }
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(56,189,248,0.18),transparent_42%),radial-gradient(circle_at_82%_14%,rgba(244,114,182,0.15),transparent_36%),linear-gradient(180deg,rgba(2,6,23,0.72),rgba(2,6,23,0.97))]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xs space-y-5 rounded-2xl border border-white/10 bg-black/45 p-6 shadow-[0_20px_55px_rgba(0,0,0,0.55)] backdrop-blur-md"
        >
          <h1
            className="text-center text-[12px] uppercase tracking-[0.28em] text-stone-100"
            style={{ fontFamily: CP }}
          >
            PSK
          </h1>

          <input
            type="password"
            autoComplete="off"
            value={psk}
            onChange={(event) => {
              setPsk(event.target.value)
              setError('')
            }}
            placeholder="Enter PSK"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm tracking-[0.03em] text-stone-100 outline-none placeholder:text-stone-500 focus:border-pink-400/40 focus:ring-1 focus:ring-pink-400/15 transition"
            style={{ fontFamily: CP }}
          />

          {error && (
            <p className="rounded-xl border border-rose-500/25 bg-rose-950/50 px-3 py-2 text-center text-[11px] text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-full border border-pink-300/20 bg-gradient-to-r from-pink-600/90 to-rose-700/90 py-3 text-sm tracking-wide text-stone-100 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
            style={{ fontFamily: CP }}
          >
            {status === 'loading' ? 'verifying…' : 'continue'}
          </button>

          <p className="text-center text-[9px] uppercase tracking-[0.2em] text-stone-600" style={{ fontFamily: CP }}>
            <Link href={ROUTES.LOGIN} className="hover:text-stone-400 transition-colors">
              change code
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function PskPage() {
  return (
    <Suspense fallback={null}>
      <PskContent />
    </Suspense>
  )
}
