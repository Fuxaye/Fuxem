import type { PublicMediaSourceItem, PublicMediaSourcePayload } from '@/lib/public-media-source'

export const PUBLIC_MEDIA_SOURCE_PAYLOAD: PublicMediaSourcePayload = {
  items: [
    {
      id: 'seed-1',
      title: 'Public Teaser One',
      creator: '@model-one',
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
      summary: 'Second sample card for stream embed and mobile playback checks.',
      tags: ['public', 'stream', 'mobile'],
      bunnyLibraryId: 'REPLACE_LIBRARY_ID',
      bunnyVideoId: 'REPLACE_VIDEO_ID',
    },
    {
      id: 'seed-3',
      title: 'Public Teaser Three',
      creator: '@model-three',
      summary: 'Policy-safe preview clip intended for ad network review.',
      tags: ['public', 'policy-safe', 'review'],
      bunnyLibraryId: 'REPLACE_LIBRARY_ID',
      bunnyVideoId: 'REPLACE_VIDEO_ID',
    },
    {
      id: 'seed-4',
      title: 'Public Teaser Four',
      creator: '@model-four',
      summary: 'Additional seed content to avoid an empty public media gallery.',
      tags: ['public', 'gallery', 'compliance'],
      bunnyLibraryId: 'REPLACE_LIBRARY_ID',
      bunnyVideoId: 'REPLACE_VIDEO_ID',
    },
  ] satisfies PublicMediaSourceItem[],
}
