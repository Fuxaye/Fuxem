import type { Metadata } from 'next'

import LegalPageShell from '@/app/_components/legal-page-shell'
import { COMPLIANCE_2257 } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: '18 U.S.C. § 2257 Compliance Statement | fuxem',
  description: COMPLIANCE_2257.description,
}

export default function Compliance2257Page() {
  return <LegalPageShell document={COMPLIANCE_2257} />
}
