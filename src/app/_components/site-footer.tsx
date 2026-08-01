'use client'

import { usePathname } from 'next/navigation'

import LegalLinks from '@/app/_components/legal-links'
import { ROUTES } from '@/lib/constants'

const PUBLIC_FOOTER_ROUTES = new Set([
  ROUTES.HOME,
  ROUTES.HELP,
  ROUTES.CONTACT,
  ROUTES.WELCOME,
  ROUTES.LOG_IN,
  ROUTES.LOGIN,
  ROUTES.FORGOT,
  ROUTES.RESET,
  ROUTES.SIGNUP,
])

export default function SiteFooter() {
  const pathname = usePathname() ?? ROUTES.HOME
  const shouldRender = pathname.startsWith('/legal') || PUBLIC_FOOTER_ROUTES.has(pathname)

  if (!shouldRender) {
    return null
  }

  return (
    <footer className="border-t border-white/10 bg-[#05070f] px-4 py-5 text-stone-400 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">fuxem.xyz legal and account policies</p>
        <LegalLinks className="text-xs uppercase tracking-[0.14em]" />
      </div>
    </footer>
  )
}