import { describe, expect, it } from 'vitest'

import { getPublicMediaDisplayState, getPublicMediaGallery, getPublicMediaStreamUrl } from '../src/lib/public-media'

describe('getPublicMediaGallery', () => {
  it('surfaces the featured item first while filtering by tag and search', () => {
    const items = [
      {
        id: 'seed-2',
        title: 'Second teaser',
        creator: '@model-two',
        streamUrl: 'https://example.com/2',
        summary: 'A stream-focused clip',
        tags: ['stream', 'mobile'],
        featured: false,
      },
      {
        id: 'seed-1',
        title: 'Featured teaser',
        creator: '@model-one',
        streamUrl: 'https://example.com/1',
        summary: 'A featured preview clip',
        tags: ['public', 'teaser', 'verified'],
        featured: true,
      },
      {
        id: 'seed-3',
        title: 'Review clip',
        creator: '@model-three',
        streamUrl: 'https://example.com/3',
        summary: 'Policy-safe review clip',
        tags: ['review', 'policy-safe'],
        featured: false,
      },
    ]

    const view = getPublicMediaGallery(items, { search: 'preview', tag: 'all', sort: 'featured' })

    expect(view.featured?.id).toBe('seed-1')
    expect(view.items.map((item) => item.id)).toEqual([])
  })

  it('sorts the remaining cards alphabetically by title', () => {
    const items = [
      {
        id: 'seed-b',
        title: 'Beta clip',
        creator: '@model-b',
        streamUrl: 'https://example.com/b',
        summary: 'Beta summary',
        tags: ['public'],
      },
      {
        id: 'seed-a',
        title: 'Alpha clip',
        creator: '@model-a',
        streamUrl: 'https://example.com/a',
        summary: 'Alpha summary',
        tags: ['public'],
      },
    ]

    const view = getPublicMediaGallery(items, { search: '', tag: 'all', sort: 'title' })

    expect(view.items.map((item) => item.id)).toEqual(['seed-a', 'seed-b'])
  })

  it('marks Bunny placeholders as a placeholder state for safe preview rendering', () => {
    const state = getPublicMediaDisplayState({
      id: 'seed-placeholder',
      title: 'Awaiting Bunny asset',
      creator: '@creator',
      streamUrl: 'https://iframe.mediadelivery.net/embed/REPLACE_LIBRARY_ID/REPLACE_VIDEO_ID?autoplay=false',
      summary: 'Pending embed swap',
      tags: ['pending'],
    })

    expect(state.kind).toBe('placeholder')
    expect(state.src).toBeNull()
    expect(state.fallbackLabel).toBe('Bunny embed pending')
  })

  it('derives an embed URL from Bunny library and video IDs when no explicit stream URL is provided', () => {
    const url = getPublicMediaStreamUrl({
      id: 'seed-auto',
      title: 'Auto Bunny clip',
      creator: '@creator',
      summary: 'Built from IDs',
      tags: ['auto'],
      bunnyLibraryId: '12345',
      bunnyVideoId: 'abcde',
    })

    expect(url).toBe('https://iframe.mediadelivery.net/embed/12345/abcde?autoplay=false')
  })
})
