export type PublicMediaItem = {
  id: string
  title: string
  creator: string
  streamUrl?: string
  posterUrl?: string
  summary: string
  tags: string[]
  featured?: boolean
  bunnyLibraryId?: string
  bunnyVideoId?: string
}

// Replace streamUrl values with Bunny Stream links.
export const PUBLIC_MEDIA_VIDEOS: PublicMediaItem[] = [
  {
    id: 'seed-1',
    title: 'Public Teaser One',
    creator: '@model-one',
    streamUrl: '',
    posterUrl: '',
    summary: 'Intro teaser clip for public preview and compliance checks.',
    tags: ['public', 'teaser', 'verified'],
    featured: true,
    bunnyLibraryId: 'REPLACE_LIBRARY_ID',
    bunnyVideoId: 'REPLACE_VIDEO_ID',
  },
  {
    id: 'seed-2',
    title: 'Public Teaser Two',
    creator: '@model-two',
    streamUrl: '',
    posterUrl: '',
    summary: 'Second sample card for stream embed and mobile playback checks.',
    tags: ['public', 'stream', 'mobile'],
    bunnyLibraryId: 'REPLACE_LIBRARY_ID',
    bunnyVideoId: 'REPLACE_VIDEO_ID',
  },
  {
    id: 'seed-3',
    title: 'Public Teaser Three',
    creator: '@model-three',
    streamUrl: '',
    posterUrl: '',
    summary: 'Policy-safe preview clip intended for ad network review.',
    tags: ['public', 'policy-safe', 'review'],
    bunnyLibraryId: 'REPLACE_LIBRARY_ID',
    bunnyVideoId: 'REPLACE_VIDEO_ID',
  },
  {
    id: 'seed-4',
    title: 'Public Teaser Four',
    creator: '@model-four',
    streamUrl: '',
    posterUrl: '',
    summary: 'Additional seed content to avoid an empty public media gallery.',
    tags: ['public', 'gallery', 'compliance'],
    bunnyLibraryId: 'REPLACE_LIBRARY_ID',
    bunnyVideoId: 'REPLACE_VIDEO_ID',
  },
]
