import type { Metadata } from 'next'

import LegalPageShell from '@/app/_components/legal-page-shell'
import { PRIVACY_POLICY } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: 'Privacy Policy | fuxem',
  description: PRIVACY_POLICY.description,
}

export default function PrivacyPolicyPage() {
  return <LegalPageShell document={PRIVACY_POLICY} />
}