'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { NEW_MEMBER_PIN, ROUTES } from '@/lib/constants'

const CP = "Copperplate, 'Copperplate Gothic Light', fantasy"

function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return ROUTES.DASHBOARD
  return value
}

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        identifier: identifier.trim(),
        password,
        passcode: NEW_MEMBER_PIN,
      }),
    })

    setPending(false)
    if (!response.ok) {
      setError('Invalid credentials')
      return
    }

    router.push(safeReturnTo(params.get('returnTo')))
    router.refresh()
  }

  return (
    <main className="relative isolate min-h-screen text-slate-100">
      <Image
        src="/welcome2.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none absolute inset-0 z-0 object-cover"
        style={{ objectPosition: 'center 18%' }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(circle at 18% 16%, rgba(56,189,248,0.18), transparent 42%), radial-gradient(circle at 82% 14%, rgba(244,114,182,0.15), transparent 36%), linear-gradient(180deg, rgba(2,6,23,0.72), rgba(2,6,23,0.97))',
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 py-6">
        <header className="flex items-center justify-between">
          <Link href="/welcome" className="text-sm font-semibold tracking-[0.12em] text-stone-100">
            FUXEM
          </Link>
          <Link href="/welcome" className="text-sm text-stone-300 underline-offset-4 hover:underline">
            Back
          </Link>
        </header>

        <section className="my-auto w-full rounded-2xl border border-white/8 bg-black/25 px-5 py-7 shadow-[0_12px_35px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:px-9 sm:py-8">
          <div className="mb-6 border-b border-white/10 pb-5 text-center">
            <p className="text-[10px] uppercase tracking-[0.22em] text-pink-200/80" style={{ fontFamily: CP }}>
              Members only
            </p>
            <h1 className="mt-2 text-xl tracking-[0.2em] text-stone-100" style={{ fontFamily: CP }}>
              Log in
            </h1>
            <p className="mt-2 text-sm text-stone-400">You must be an adult.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-100 outline-none placeholder:text-stone-500 transition focus:border-pink-400/40 focus:ring-1 focus:ring-pink-400/15"
              placeholder="Email or user ID"
              aria-label="Email or user ID"
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
            />
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-100 outline-none placeholder:text-stone-500 transition focus:border-pink-400/40 focus:ring-1 focus:ring-pink-400/15"
              placeholder="Password"
              aria-label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : null}
            <button
              className="w-full rounded-full border border-pink-300/20 bg-gradient-to-r from-pink-600/90 to-rose-700/90 py-3 text-sm tracking-wide text-stone-100 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
              style={{ fontFamily: CP }}
              disabled={pending}
            >
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <Link className="mt-4 inline-block text-sm text-stone-300 underline-offset-4 hover:underline" href={ROUTES.FORGOT}>
            Forgot password
          </Link>
        </section>
      </div>
    </main>
  )
}
