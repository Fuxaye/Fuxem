import './globals.css'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { DM_Mono, DM_Sans, Nunito } from 'next/font/google'

import AgeGate from '@/app/_components/age-gate'
import CookieConsent from '@/app/_components/cookie-consent'
import SiteFooter from '@/app/_components/site-footer'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
})

export const metadata: Metadata = {
  title: 'fuxem',
  description: 'fuxem is a dark-themed creator platform for verified adults, social discovery, uploads, and community.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${nunito.variable} ${dmSans.variable} ${dmMono.variable}`}>
        <AgeGate />
        <CookieConsent />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  )
}
