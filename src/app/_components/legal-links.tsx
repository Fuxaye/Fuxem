import Link from 'next/link'

import { ROUTES } from '@/lib/constants'

type LegalLinksProps = {
  className?: string
  linkClassName?: string
}

const LINKS = [
  { href: ROUTES.LEGAL_TERMS, label: 'Terms' },
  { href: ROUTES.LEGAL_PRIVACY, label: 'Privacy' },
  { href: ROUTES.LEGAL_COMMUNITY_GUIDELINES, label: 'Community' },
  { href: ROUTES.LEGAL_DMCA, label: 'DMCA' },
  { href: ROUTES.LEGAL_2257, label: '2257' },
]

export default function LegalLinks({
  className = '',
  linkClassName = 'text-stone-400 transition hover:text-stone-100',
}: LegalLinksProps) {
  return (
    <div className={className}>
      {LINKS.map((link, index) => (
        <span key={link.href}>
          {index > 0 ? <span className="mx-2 text-stone-600">•</span> : null}
          <Link href={link.href} className={linkClassName}>
            {link.label}
          </Link>
        </span>
      ))}
    </div>
  )
}