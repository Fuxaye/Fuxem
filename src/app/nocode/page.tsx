'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { MESSAGES, MIN_AGE, MIN_PASSWORD_LENGTH, ROUTES, USERNAME_REGEX } from '@/lib/constants'
import { getMaximumBirthDateIso, isIsoDateOfBirthOldEnough } from '@/lib/dob'

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'error'

type FormErrors = Partial<Record<'username' | 'email' | 'dateOfBirth' | 'password' | 'confirmPassword', string>>

type RegisterResponse = {
  error?: string
  message?: string
  pin?: string
  username?: string
  accountName?: string
  requiresEmailVerification?: boolean
  user?: { id: string }
}

const CP = "Copperplate, 'Copperplate Gothic Light', fantasy"
const PROFILE_SETUP_PATH = `${ROUTES.PROFILE}?setup=1`
const LOGIN_AFTER_SIGNUP = `${ROUTES.LOGIN}?returnTo=${encodeURIComponent(PROFILE_SETUP_PATH)}`
const MAX_BIRTH_DATE = getMaximumBirthDateIso()

export default function NoCodeSignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [availability, setAvailability] = useState<Availability>('idle')
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState('')
  const [registration, setRegistration] = useState<RegisterResponse | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  useEffect(() => {
    const errorCode = new URLSearchParams(window.location.search).get('error')
    if (errorCode === 'expired') setFormError(MESSAGES.TOKEN_EXPIRED)
    if (errorCode === 'invalid_name') setFormError(MESSAGES.NAME_MISMATCH)
  }, [])

  useEffect(() => {
    const normalizedUsername = username.trim().toLowerCase()
    if (!USERNAME_REGEX.test(normalizedUsername)) {
      setAvailability('idle')
      return
    }

    const controller = new AbortController()
    setAvailability('checking')

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/auth/username-availability?username=${encodeURIComponent(normalizedUsername)}`,
          { signal: controller.signal }
        )
        if (!response.ok) throw new Error('Availability check failed')

        const result = (await response.json()) as { available: boolean }
        setAvailability(result.available ? 'available' : 'taken')
      } catch {
        if (!controller.signal.aborted) setAvailability('error')
      }
    }, 350)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [username])

  function validateForm(): FormErrors {
    const nextErrors: FormErrors = {}
    const normalizedUsername = username.trim().toLowerCase()

    if (!USERNAME_REGEX.test(normalizedUsername)) {
      nextErrors.username = 'Use 3–20 letters, numbers, or underscores.'
    } else if (availability === 'taken') {
      nextErrors.username = 'That User ID is already in use.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!dateOfBirth || !isIsoDateOfBirthOldEnough(dateOfBirth)) {
      nextErrors.dateOfBirth = MESSAGES.INVALID_DATE_OF_BIRTH
    }
    if (password.trim().length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = MESSAGES.PASSWORD_MIN_LENGTH
    }
    if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'

    return nextErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    const nextErrors = validateForm()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || status === 'submitting' || availability === 'checking') {
      if (availability === 'checking') {
        setFormError('Still checking User ID availability. Wait a moment and try again.')
      }
      return
    }

    setStatus('submitting')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          dateOfBirth,
          password,
        }),
      })

      const data = (await response.json()) as RegisterResponse

      if (!response.ok) {
        if (data.error === MESSAGES.USERNAME_EXISTS) {
          setErrors((previous) => ({ ...previous, username: data.error }))
        } else if (data.error === MESSAGES.EMAIL_EXISTS) {
          setErrors((previous) => ({ ...previous, email: 'This email already has an account.' }))
        } else if (data.error === MESSAGES.INVALID_DATE_OF_BIRTH) {
          setErrors((previous) => ({ ...previous, dateOfBirth: data.error }))
        } else {
          setFormError(data.error || MESSAGES.ERROR_GENERAL)
        }
        setStatus('idle')
        return
      }

      setRegistration(data)
      setStatus('success')

      if (!data.requiresEmailVerification && data.user) {
        router.push(PROFILE_SETUP_PATH)
      }
    } catch {
      setFormError(MESSAGES.ERROR_GENERAL)
      setStatus('idle')
    }
  }

  function fieldClass(hasError: boolean) {
    return `mt-1 w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-stone-100 outline-none placeholder:text-stone-500 focus:border-pink-400/40 focus:ring-1 focus:ring-pink-400/15 transition ${
      hasError ? 'border-rose-400/70' : 'border-white/10'
    }`
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

      <header className="relative z-10 mx-auto flex w-full max-w-xl items-center justify-between px-4 pt-6">
        <Link href="/welcome" className="text-sm font-semibold tracking-[0.12em] text-stone-100">
          FUXEM
        </Link>
        <Link href="/welcome" className="text-sm text-stone-300 underline-offset-4 hover:underline">
          Back
        </Link>
      </header>

      <section className="relative z-10 mx-auto mt-8 w-full max-w-xl rounded-2xl border border-white/8 bg-black/25 px-5 py-6 shadow-[0_12px_35px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:px-9 sm:py-8">
        <div className="mb-6 border-b border-white/10 pb-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-pink-200/80" style={{ fontFamily: CP }}>New account</p>
          <h1 className="mt-2 text-center text-xl tracking-[0.2em] text-stone-100" style={{ fontFamily: CP }}>Create your profile</h1>
          <p className="mt-2 text-center text-sm text-stone-400">Start with your basic account details.</p>
        </div>

        {status === 'success' ? (
          <div className="space-y-4">
            <p role="status" className="rounded-xl border border-emerald-300/35 bg-emerald-400/12 px-4 py-3 text-sm text-emerald-100">
              {registration?.message || MESSAGES.ACCOUNT_CREATED}
            </p>
            {registration?.username && (
              <p className="text-center text-sm text-stone-200">
                User ID: <span className="font-semibold">{registration.username}</span>
              </p>
            )}
            {registration?.accountName && (
              <p className="text-center text-sm text-stone-200">
                Member marker: <span className="font-semibold">{registration.accountName}</span>
              </p>
            )}
            {registration?.pin && (
              <p className="text-center text-sm text-stone-200">
                Starter PIN: <span className="font-semibold tracking-[0.2em]">{registration.pin}</span>
              </p>
            )}
            <p className="text-center text-xs text-stone-400">
              {registration?.requiresEmailVerification
                ? 'Check your email for a verification link, then continue below.'
                : 'Next: add a photo and finish your public profile.'}
            </p>
            <Link
              href={registration?.requiresEmailVerification ? ROUTES.VERIFY_EMAIL : LOGIN_AFTER_SIGNUP}
              className="inline-flex w-full items-center justify-center rounded-full border border-pink-300/20 bg-gradient-to-r from-pink-600/90 to-rose-700/90 px-4 py-3 text-sm tracking-wide text-stone-100 transition hover:brightness-110"
              style={{ fontFamily: CP }}
            >
              {registration?.requiresEmailVerification ? 'Resend or check email' : 'Log in and build profile'}
            </Link>
            <Link
              href={LOGIN_AFTER_SIGNUP}
              className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-4 py-3 text-sm text-stone-300 transition hover:border-white/30"
              style={{ fontFamily: CP }}
            >
              Log in later
            </Link>
          </div>
        ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <label className="block text-[10px] uppercase tracking-[0.22em] text-stone-400" style={{ fontFamily: CP }}>
            User ID
            <input
              autoComplete="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value.slice(0, 20))
                setAvailability('idle')
                setErrors((previous) => ({ ...previous, username: undefined }))
                setFormError('')
              }}
              className={fieldClass(!!errors.username)}
              aria-invalid={!!errors.username}
              aria-describedby="username-hint username-status"
              placeholder="your_user_id"
            />
            <span id="username-hint" className="mt-1 block text-[11px] font-normal normal-case tracking-normal text-stone-500">
              3–20 letters, numbers, or underscores.
            </span>
            <span id="username-status" aria-live="polite" className="mt-1 block text-[11px] font-normal normal-case tracking-normal">
              {availability === 'checking' && <span className="text-stone-400">Checking availability…</span>}
              {availability === 'available' && <span className="text-emerald-200">User ID is available.</span>}
              {availability === 'taken' && <span className="text-rose-300">That User ID is already in use.</span>}
              {availability === 'error' && <span className="text-rose-300">Could not check availability. Try again.</span>}
            </span>
            {errors.username && <span className="mt-1 block text-[11px] normal-case tracking-normal text-rose-300">{errors.username}</span>}
          </label>

          <label className="block text-[10px] uppercase tracking-[0.22em] text-stone-400" style={{ fontFamily: CP }}>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setFormError('')
              }}
              className={fieldClass(!!errors.email)}
              aria-invalid={!!errors.email}
              placeholder="you@example.com"
            />
            {errors.email && <span className="mt-1 block text-[11px] normal-case tracking-normal text-rose-300">{errors.email}</span>}
          </label>

          <label className="block text-[10px] uppercase tracking-[0.22em] text-stone-400" style={{ fontFamily: CP }}>
            Date of birth
            <input
              type="date"
              autoComplete="bday"
              max={MAX_BIRTH_DATE}
              value={dateOfBirth}
              onChange={(event) => {
                setDateOfBirth(event.target.value)
                setErrors((previous) => ({ ...previous, dateOfBirth: undefined }))
                setFormError('')
              }}
              className={fieldClass(!!errors.dateOfBirth)}
              aria-invalid={!!errors.dateOfBirth}
            />
            <span className="mt-1 block text-[11px] font-normal normal-case tracking-normal text-stone-500">You must be at least {MIN_AGE} years old.</span>
            {errors.dateOfBirth && <span className="mt-1 block text-[11px] normal-case tracking-normal text-rose-300">{errors.dateOfBirth}</span>}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-[10px] uppercase tracking-[0.22em] text-stone-400" style={{ fontFamily: CP }}>
              Password
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setFormError('')
                }}
                className={fieldClass(!!errors.password)}
                aria-invalid={!!errors.password}
                placeholder="At least 8 characters"
              />
              {errors.password && <span className="mt-1 block text-[11px] normal-case tracking-normal text-rose-300">{errors.password}</span>}
            </label>

            <label className="block text-[10px] uppercase tracking-[0.22em] text-stone-400" style={{ fontFamily: CP }}>
              Confirm password
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  setFormError('')
                }}
                className={fieldClass(!!errors.confirmPassword)}
                aria-invalid={!!errors.confirmPassword}
                placeholder="Re-enter password"
              />
              {errors.confirmPassword && <span className="mt-1 block text-[11px] normal-case tracking-normal text-rose-300">{errors.confirmPassword}</span>}
            </label>
          </div>

          {formError && (
            <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-950/50 px-3 py-2 text-center text-[11px] text-rose-300">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-full border border-pink-300/20 bg-gradient-to-r from-pink-600/90 to-rose-700/90 py-3 text-sm tracking-wide text-stone-100 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
            style={{ fontFamily: CP }}
          >
            {status === 'submitting' ? 'creating account...' : 'create account'}
          </button>
        </form>
        )}
      </section>
    </main>
  )
}