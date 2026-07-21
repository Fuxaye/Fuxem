import type { Metadata } from 'next'

import LegalPageShell from '@/app/_components/legal-page-shell'
import { TERMS_OF_SERVICE } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: 'Terms of Service | fuxem',
  description: TERMS_OF_SERVICE.description,
}

export default function TermsOfServicePage() {
  return <LegalPageShell document={TERMS_OF_SERVICE} />
}