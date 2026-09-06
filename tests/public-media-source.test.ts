import { describe, expect, it } from 'vitest'

import { loadPublicMediaSourceItems, normalizePublicMediaItems } from '../src/lib/public-media-source'

describe('loadPublicMediaSourceItems', () => {
  it('loads items from a JSON-style payload', () => {
    const items = loadPublicMediaSourceItems({
      items: [
        {
          id: 'json-item',
          title: 'JSON clip',
          creator: '@creator',
          summary: 'Loaded from a data payload',
          featured: true,
        },
      ],
    })

    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('JSON clip')
  })
})

describe('normalizePublicMediaItems', () => {
  it('normalizes incoming source items into the gallery shape', () => {
    const items = normalizePublicMediaItems([
      {
        id: 'seed-live',
        title: 'Live Bunny clip',
        creator: '@creator',
        summary: 'Loaded from a data source',
        featured: true,
        bunnyLibraryId: '12345',
        bunnyVideoId: 'abcde',
      },
    ])

    expect(items).toHaveLength(1)
    expect(items[0].tags).toEqual([])
    expect(items[0].featured).toBe(true)
    expect(items[0].bunnyLibraryId).toBe('12345')
    expect(items[0].bunnyVideoId).toBe('abcde')
  })
})
