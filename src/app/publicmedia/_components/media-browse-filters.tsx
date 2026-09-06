import { Search } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export type BrowseSort = 'featured' | 'title'

type MediaBrowseFiltersProps = {
  search: string
  tag: string
  sort: BrowseSort
  tags: string[]
  onSearchChange: (value: string) => void
  onTagChange: (value: string) => void
  onSortChange: (value: BrowseSort) => void
  onClear: () => void
}

const controlClass =
  'mt-2 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25'

export default function MediaBrowseFilters({
  search,
  tag,
  sort,
  tags,
  onSearchChange,
  onTagChange,
  onSortChange,
  onClear,
}: MediaBrowseFiltersProps) {
  const hasFilters = Boolean(search.trim()) || tag !== 'all' || sort !== 'featured'

  return (
    <Card className="rounded-2xl border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[0_24px_80px_rgba(0,0,0,0.18)] lg:sticky lg:top-5">
      <CardHeader className="gap-1 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80">Index</p>
        <CardTitle className="text-xl text-[var(--text-primary)]">Browse videos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5 pt-0">
        <div>
          <Label htmlFor="public-media-search" className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Search videos
          </Label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
            <Input
              id="public-media-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Title, member, or tag"
              className={cn(controlClass, 'pl-9')}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <div>
            <Label htmlFor="public-media-tag" className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Tags
            </Label>
            <select
              id="public-media-tag"
              value={tag}
              onChange={(event) => onTagChange(event.target.value)}
              className={controlClass}
            >
              {tags.map((option) => (
                <option key={option} value={option} className="bg-[#1e1c2e] text-[var(--text-primary)]">
                  {option === 'all' ? 'All tags' : option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="public-media-sort" className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Sort by
            </Label>
            <select
              id="public-media-sort"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as BrowseSort)}
              className={controlClass}
            >
              <option value="featured" className="bg-[#1e1c2e] text-[var(--text-primary)]">Featured</option>
              <option value="title" className="bg-[#1e1c2e] text-[var(--text-primary)]">Title</option>
            </select>
          </div>
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-primary underline-offset-4 transition hover:text-[var(--text-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]"
          >
            Clear filters
          </button>
        ) : null}
      </CardContent>
    </Card>
  )
}
