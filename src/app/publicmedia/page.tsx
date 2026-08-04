import type { Metadata } from 'next'
import PublicMediaClient from './publicmedia-client'

export const metadata: Metadata = {
  title: 'Public Media | fuxem',
  description:
    'Public media showcase for compliance and ad network review. Stream-ready cards for Bunny links.',
}

export default function PublicMediaPage() {
  return <PublicMediaClient />
}
