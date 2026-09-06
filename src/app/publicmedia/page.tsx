import type { Metadata } from 'next'

import PublicMediaClient from './publicmedia-client'
import { getPublicMediaPageData } from '@/lib/public-media-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Public Screening | fuxem',
  description:
    'Public videos shared by verified Fuxem members. Watch freely; member interactions require an account.',
}

export default async function PublicMediaPage() {
  const { videos, isAuthenticated } = await getPublicMediaPageData()

  return (
    <PublicMediaClient
      videos={videos}
      isAuthenticated={isAuthenticated}
      initialError={null}
    />
  )
}
