import type { Metadata } from 'next'
import Image from 'next/image'

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
    <div className="ui-page-shell relative isolate min-h-screen overflow-hidden text-slate-100">
      <Image
        src="/3.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-contain"
      />

      <div className="absolute bottom-[calc(0.75rem+65px)] left-1/2 z-30 -translate-x-1/2">
        <PinEntryBox />
      </div>

      <WelcomeJukebox />

      <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 px-4 text-center">
        <div className="mx-auto inline-block rounded-full border border-white/10 bg-black/20 px-2.5 py-1 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <p className="whitespace-nowrap font-['Copperplate','Copperplate_Gothic_Light',fantasy] text-[10px] uppercase leading-none tracking-[0.12em] text-white/70">
            Sexual Activity Club - Adults Only
          </p>
        </div>
      </div>
    </div>
  )
}
