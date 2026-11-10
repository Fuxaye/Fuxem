'use client'

import { type FormEvent, useRef, useState } from 'react'

import { NEW_MEMBER_PIN, QUICK_JOIN_PIN, ROUTES } from '@/lib/constants'

const CP = "Copperplate, 'Copperplate Gothic Light', fantasy"

export default function PinEntryBox() {
  const [open, setOpen] = useState(false)
  const [ageGateOpen, setAgeGateOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<'empty' | 'invalid' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function playKeyFeedback() {
    if (typeof window === 'undefined') return

    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(12)
      }

      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return

      const context = new AudioContextClass()
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = 760
      gainNode.gain.value = 0.025

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      oscillator.start()
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.05)
      oscillator.stop(context.currentTime + 0.05)
      oscillator.onended = () => {
        void context.close()
      }
    } catch {
      // Audio/haptics are optional; never block PIN entry.
    }
  }

  function goTo(path: string) {
    window.location.assign(path)
  }

  function submitPin(code: string) {
    if (!code) {
      setError('empty')
      return
    }

    if (code === QUICK_JOIN_PIN) {
      goTo(ROUTES.SIGNUP)
      return
    }

    if (code === NEW_MEMBER_PIN) {
      goTo(ROUTES.LOGIN)
      return
    }

    setError('invalid')
  }

  function appendDigit(digit: string) {
    setPin((previousPin) => {
      if (previousPin.length >= 4) return previousPin
      return `${previousPin}${digit}`
    })
    playKeyFeedback()
    if (error) setError(null)
  }

  function removeDigit() {
    setPin((previousPin) => previousPin.slice(0, -1))
    playKeyFeedback()
    if (error) setError(null)
  }

  function clearPin() {
    setPin('')
    playKeyFeedback()
    if (error) setError(null)
  }

  function closePanel() {
    setOpen(false)
    setError(null)
  }

  function togglePanel() {
    if (open) {
      closePanel()
      return
    }

    setOpen(true)
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function openAgeGate() {
    setOpen(false)
    setAgeGateOpen(true)
  }

  function acceptAgeGate() {
    try {
      sessionStorage.setItem('fuxem_age_verified', '1')
    } catch {
      // Continue even if the browser blocks storage.
    }
    setAgeGateOpen(false)
    window.open('https://www.dyxmyx.com', '_blank', 'noopener,noreferrer')
  }

  function declineAgeGate() {
    setAgeGateOpen(false)
    window.location.href = 'https://www.google.com'
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitPin(pin)
  }

  return (
    <div className="relative flex flex-col items-center">
      {open && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="absolute bottom-full left-1/2 z-30 mb-3 max-h-[calc(100dvh-8rem)] w-[min(16rem,calc(100vw-1rem))] -translate-x-1/2 overflow-y-auto rounded-2xl border border-white/20 bg-black/90 p-4 shadow-[0_16px_44px_rgba(0,0,0,0.6)] backdrop-blur-md sm:w-64"
        >
          <label
            htmlFor="access-code-input"
            className="mb-1 block text-center text-[10px] uppercase tracking-[0.24em] text-stone-100"
            style={{ fontFamily: CP }}
          >
            PIN
          </label>
          <p
            className="mb-3 text-center text-[8px] tracking-[0.14em] text-stone-300/90 select-none"
            style={{ fontFamily: CP }}
          >
            ENTER ACCESS CODE
          </p>

          <div className="mb-3 grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, index) => {
              const hasDigit = index < pin.length
              return (
                <div
                  key={index}
                  className="flex h-12 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-xl text-stone-100"
                  aria-hidden="true"
                >
                  {hasDigit ? '•' : ''}
                </div>
              )
            })}
          </div>

          <input
            ref={inputRef}
            id="access-code-input"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
              if (error) setError(null)
            }}
            className="mb-3 w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-center text-base tracking-[0.3em] text-white outline-none placeholder:tracking-normal placeholder:text-stone-600 focus:border-sky-300/80 focus:ring-2 focus:ring-sky-300/30"
            aria-label="Access code"
            aria-invalid={error !== null}
            aria-describedby={error ? 'pin-error pin-hint' : undefined}
          />

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => appendDigit(String(digit))}
                className="h-12 rounded-lg border border-white/20 bg-white/10 text-base font-semibold text-stone-100 transition hover:bg-white/20 active:scale-[0.98]"
                style={{ fontFamily: CP }}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={clearPin}
              className="h-12 rounded-lg border border-white/20 bg-white/10 text-[10px] uppercase tracking-[0.2em] text-stone-200 transition hover:bg-white/20 active:scale-[0.98]"
              style={{ fontFamily: CP }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => appendDigit('0')}
              className="h-12 rounded-lg border border-white/20 bg-white/10 text-base font-semibold text-stone-100 transition hover:bg-white/20 active:scale-[0.98]"
              style={{ fontFamily: CP }}
            >
              0
            </button>
            <button
              type="button"
              onClick={removeDigit}
              className="h-12 rounded-lg border border-white/20 bg-white/10 text-[10px] uppercase tracking-[0.2em] text-stone-200 transition hover:bg-white/20 active:scale-[0.98]"
              style={{ fontFamily: CP }}
            >
              Delete
            </button>
          </div>

          {error === 'empty' && (
            <p id="pin-error" role="alert" className="mt-2 text-center text-[10px] text-rose-300" style={{ fontFamily: CP }}>
              Enter code
            </p>
          )}

          {error === 'invalid' && (
            <div id="pin-error" role="alert" className="mt-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.12em] text-rose-300" style={{ fontFamily: CP }}>
                Invalid pin
              </p>
              <p
                id="pin-hint"
                className="mt-1 text-[7px] tracking-[0.08em] text-red-500"
                style={{ fontFamily: CP }}
              >
                0000 = nocode
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => submitPin(pin)}
            className="mt-3 w-full rounded-lg border border-white/25 bg-white/15 py-2.5 text-[10px] uppercase tracking-[0.22em] text-stone-100 transition hover:bg-white/25 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/40"
            style={{ fontFamily: CP }}
          >
            Submit
          </button>
        </form>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={open ? 'Close PIN entry' : 'Open PIN entry'}
          aria-expanded={open}
          onClick={togglePanel}
          className="h-3.5 w-3.5 rounded-full border border-sky-200/70 bg-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.85)] transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70"
        />
        <button
          type="button"
          aria-label="Open public media"
          onClick={() => {
            window.location.assign('/publicmedia')
          }}
          className="h-3.5 w-3.5 rounded-full border border-blue-200/80 bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.85)] transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70"
        />
        <button
          type="button"
          aria-label="Open dyxmyx.com"
          onClick={openAgeGate}
          className="h-3.5 w-3.5 rounded-full border border-rose-200/70 bg-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.8)] transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
        />
      </div>
      {ageGateOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-age-gate-title"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 px-4"
        >
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#05070f] p-8 text-center shadow-2xl">
            <p className="mb-1 text-xs uppercase tracking-[0.18em] text-stone-500">Adults only</p>
            <h2 id="welcome-age-gate-title" className="mb-4 text-2xl font-semibold tracking-tight text-white">
              You must be 18 or older to enter
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-stone-400">
              This link contains sexually explicit adult content intended solely for consenting adults.
              By continuing, you confirm you are at least 18 years of age and that viewing adult content is legal where you are located.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={acceptAgeGate}
                className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-stone-200"
              >
                I am 18 or older — Enter
              </button>
              <button
                type="button"
                onClick={declineAgeGate}
                className="rounded-lg border border-white/15 px-6 py-2.5 text-sm text-stone-400 transition hover:border-white/30 hover:text-stone-200"
              >
                I am under 18 — Leave
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
