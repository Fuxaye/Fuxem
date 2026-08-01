export type PublicMediaSourceItem = {
  id: string
  title: string
  creator: string
  summary: string
  featured?: boolean
  tags?: string[]
  streamUrl?: string
  bunnyLibraryId?: string
  bunnyVideoId?: string
}

export type PublicMediaSourceEntry = {
  id: string
  title: string
  creator: string
  streamUrl?: string
  summary: string
  tags: string[]
  featured?: boolean
  bunnyLibraryId?: string
  bunnyVideoId?: string
}

export type PublicMediaSourcePayload = {
  items?: PublicMediaSourceItem[]
}

export function loadPublicMediaSourceItems(payload?: PublicMediaSourcePayload | null): PublicMediaSourceItem[] {
  const items = payload?.items ?? []
  return items.filter((item): item is PublicMediaSourceItem => Boolean(item?.id))
}

export function normalizePublicMediaItems(items: PublicMediaSourceItem[]): PublicMediaSourceEntry[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    creator: item.creator,
    streamUrl: item.streamUrl?.trim() || undefined,
    summary: item.summary,
    tags: item.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
    featured: Boolean(item.featured),
    bunnyLibraryId: item.bunnyLibraryId?.trim() || undefined,
    bunnyVideoId: item.bunnyVideoId?.trim() || undefined,
  }))
}
