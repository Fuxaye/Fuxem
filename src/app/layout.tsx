import './globals.css'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Cinzel_Decorative, Cormorant_Garamond, DM_Mono } from 'next/font/google'

import AgeGate from '@/app/_components/age-gate'
import CookieConsent from '@/app/_components/cookie-consent'
import SiteFooter from '@/app/_components/site-footer'

const cinzel = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel-decorative',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant-garamond',
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
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className={`${cinzel.variable} ${cormorant.variable} ${dmMono.variable}`}>
        <AgeGate />
        <CookieConsent />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  )
}
