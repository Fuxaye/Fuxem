'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

import { MESSAGES, ROUTES } from '@/lib/constants'

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = (await response.json()) as { message?: string; error?: string }
      if (!response.ok) {
        setError(data.error || MESSAGES.ERROR_GENERAL)
        return
      }
      setMessage(data.message || 'Check your inbox for a verification link.')
    } catch {
      setError(MESSAGES.ERROR_GENERAL)
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 text-stone-100">
      <h1 className="text-2xl font-semibold">Verify your email</h1>
      <p className="mt-2 text-sm text-stone-400">
        We sent a link when you signed up. After you verify, you can log in and finish your profile.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm text-stone-300">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
          />
        </label>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-200">{message}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-[#7C5CFC] py-3 text-sm font-semibold disabled:opacity-60"
        >
          {pending ? 'Sending…' : 'Resend verification email'}
        </button>
      </form>

      <Link href={ROUTES.LOGIN} className="mt-6 text-sm text-stone-400 underline underline-offset-2">
        Back to log in
      </Link>
    </main>
  )
}
