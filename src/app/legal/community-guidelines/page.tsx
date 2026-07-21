import type { Metadata } from 'next'

import LegalPageShell from '@/app/_components/legal-page-shell'
import { COMMUNITY_GUIDELINES } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: 'Community Guidelines | fuxem',
  description: COMMUNITY_GUIDELINES.description,
}

export default function CommunityGuidelinesPage() {
  return <LegalPageShell document={COMMUNITY_GUIDELINES} />
}