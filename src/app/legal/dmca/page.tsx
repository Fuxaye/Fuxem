import type { Metadata } from 'next'

import LegalPageShell from '@/app/_components/legal-page-shell'
import { DMCA_POLICY } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: 'DMCA Copyright Policy | fuxem',
  description: DMCA_POLICY.description,
}

export default function DmcaPage() {
  return <LegalPageShell document={DMCA_POLICY} />
}
