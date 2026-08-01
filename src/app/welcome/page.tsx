import type { Metadata } from 'next'

import CreatorPlatformShell from '@/app/_components/creator-platform-shell'

export const metadata: Metadata = {
  title: 'Creator Platform',
  description: 'A dark-themed creator social platform with client-side routing, uploads, messages, and dashboard surfaces.',
  openGraph: {
    title: 'fuxem creator platform',
    description: 'Dark-themed social platform for creators, uploads, and community-driven discovery.',
    siteName: 'fuxem',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'fuxem creator platform',
    description: 'Creator-led social platform with dark visuals and interactive page routing.',
  },
}

export default function Welcome() {
  return <CreatorPlatformShell initialView="home" />
}
