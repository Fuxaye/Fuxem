'use client'

import { type FormEvent, useRef, useState } from 'react'

import { NEW_MEMBER_PIN, QUICK_JOIN_PIN, ROUTES } from '@/lib/constants'

const CP = "Copperplate, 'Copperplate Gothic Light', fantasy"

function KeypadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="5" r="1.5" />
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="19" cy="5" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
      <circle cx="5" cy="19" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
      <circle cx="19" cy="19" r="1.5" />
    </svg>
  )
}

export default function PinEntryBox() {
  const [open, setOpen] = useState(true)
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
          className="absolute left-1/2 top-full z-30 mt-2 max-h-[calc(100dvh-5rem)] w-[min(16rem,calc(100vw-1rem))] -translate-x-1/2 overflow-y-auto rounded-2xl border border-white/20 bg-black/90 p-4 shadow-[0_16px_44px_rgba(0,0,0,0.6)] backdrop-blur-md sm:max-h-none sm:w-64 sm:overflow-visible"
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

      <button
        type="button"
        aria-label={open ? 'Close PIN entry' : 'Open PIN entry'}
        aria-expanded={open}
        onClick={togglePanel}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-black/30 text-white/50 backdrop-blur-sm transition hover:border-white/40 hover:text-white/80 active:scale-95 focus-visible:outline-none"
      >
        <KeypadIcon />
      </button>
    </div>
  )
}
