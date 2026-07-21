import type { Metadata } from 'next'

import CreatorPlatformShell from '@/app/_components/creator-platform-shell'

export const metadata: Metadata = {
  title: 'Uploads',
  description: 'Upload photos and videos through the Bunny-backed media pipeline.',
}

export default function UploadsPage() {
  return <CreatorPlatformShell />
}