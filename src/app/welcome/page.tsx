import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import PinEntryBox from './PinEntryBox'
import WelcomeJukebox from './WelcomeJukebox'

export const metadata: Metadata = {
  title: 'Private Entry',
  description:
    'Exclusive adult social network — invite-only. fuxem is a private, verified adults-only space for discreet connection.',
  keywords: [
    'invite only adult social network',
    'private adult dating',
    'verified adults only',
    'discreet hookup platform',
    'luxury adult community',
  ],
  openGraph: {
    title: 'Private. Passionate. Yours. | fuxem',
    description: 'Exclusive adult social network — invite-only. Verified adults, discreet profiles, and private connection.',
    siteName: 'fuxem',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Private. Passionate. Yours. | fuxem',
    description: 'Exclusive adult social network — invite-only. Verified adults, private access, discreet connection.',
  },
}

export default function Welcome() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <Image
        src="/fuxembd1.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-105 object-cover opacity-40 blur-[12px]"
      />

      <Image
        src="/fuxembd1.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-contain"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.16),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(244,114,182,0.14),transparent_35%),linear-gradient(180deg,rgba(2,6,23,0.68),rgba(2,6,23,0.95))]" />

      <Link
        href="/login"
        className="absolute left-6 top-6 z-30 rounded-md border border-white/20 bg-transparent px-3 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/70 transition hover:border-white/40 hover:text-white/90"
      >
        Log In
      </Link>

      <Link
        href="/signup"
        className="absolute right-6 top-6 z-30 rounded-md border border-white/25 bg-white/10 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/90 transition hover:bg-white/20"
      >
        Sign Up
      </Link>

      <div className="absolute left-1/2 top-4 z-30 -translate-x-1/2">
        <PinEntryBox />
      </div>

      <WelcomeJukebox />

      <div className="absolute inset-x-0 bottom-[12%] z-30 text-center">
        <h1
          className="m-0 font-['Copperplate','Copperplate_Gothic_Light',fantasy] text-[clamp(3rem,12vw,8rem)] font-bold uppercase tracking-[0.25em] text-white/90 drop-shadow-[0_2px_40px_rgba(0,0,0,0.7)]"
        >
          fuxem
        </h1>
        <p className="mt-2 font-['Copperplate','Copperplate_Gothic_Light',fantasy] text-[clamp(0.6rem,1.5vw,0.85rem)] uppercase tracking-[0.35em] text-white/70">
          Sexual Activity Club - Adults Only
        </p>
      </div>
    </div>
  )
}
