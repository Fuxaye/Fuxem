export type PublicMediaGalleryItem = {
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

export type PublicMediaSort = 'featured' | 'title'

export type PublicMediaGalleryView = {
  featured: PublicMediaGalleryItem | null
  items: PublicMediaGalleryItem[]
}

export function getPublicMediaStreamUrl(item: PublicMediaGalleryItem): string | null {
  if (item.streamUrl && item.streamUrl.trim().length > 0) {
    const placeholderPattern = /REPLACE_LIBRARY_ID|REPLACE_VIDEO_ID/i

    if (placeholderPattern.test(item.streamUrl)) {
      return null
    }

    return item.streamUrl
  }

  const libraryId = item.bunnyLibraryId?.trim()
  const videoId = item.bunnyVideoId?.trim()

  if (!libraryId || !videoId || libraryId === 'REPLACE_LIBRARY_ID' || videoId === 'REPLACE_VIDEO_ID') {
    return null
  }

  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false`
}

export type PublicMediaDisplayState =
  | {
      kind: 'embed'
      src: string
      fallbackLabel: null
    }
  | {
      kind: 'placeholder'
      src: null
      fallbackLabel: string
    }

export function getPublicMediaDisplayState(item: PublicMediaGalleryItem): PublicMediaDisplayState {
  const src = getPublicMediaStreamUrl(item)

  if (!src) {
    return {
      kind: 'placeholder',
      src: null,
      fallbackLabel: 'Bunny embed pending',
    }
  }

  return {
    kind: 'embed',
    src,
    fallbackLabel: null,
  }
}

export function getPublicMediaGallery(
  items: PublicMediaGalleryItem[],
  filters: { search: string; tag: string; sort: PublicMediaSort }
): PublicMediaGalleryView {
  const normalizedSearch = filters.search.trim().toLowerCase()
  const normalizedTag = filters.tag.trim().toLowerCase()

  const filtered = items.filter((item) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      item.title.toLowerCase().includes(normalizedSearch) ||
      item.creator.toLowerCase().includes(normalizedSearch) ||
      item.summary.toLowerCase().includes(normalizedSearch) ||
      item.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))

    const matchesTag = normalizedTag === 'all' || item.tags.some((tag) => tag.toLowerCase() === normalizedTag)

    return matchesSearch && matchesTag
  })

  const featured = filtered.find((item) => item.featured) ?? null
  const remaining = featured ? filtered.filter((item) => item.id !== featured.id) : filtered

  const sortedRemaining = [...remaining].sort((left, right) => {
    if (filters.sort === 'title') {
      return left.title.localeCompare(right.title)
    }

    return 0
  })

  return {
    featured,
    items: sortedRemaining,
  }
}
