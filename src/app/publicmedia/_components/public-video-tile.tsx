import { ArrowRight, PlayCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import HostedVideoFrame from './hosted-video-frame'
import MemberGateControls from './member-gate-controls'
import type { PublicVideoTileProps } from './public-media-types'

export default function PublicVideoTile({
  video,
  isAuthenticated,
  onWatch,
  onMemberAction,
}: PublicVideoTileProps) {
  return (
    <Card className="group overflow-hidden rounded-2xl border-[var(--border-subtle)] bg-[var(--bg-card)] transition-colors hover:border-primary/35">
      <div className="relative">
        <HostedVideoFrame video={video} onSelect={() => onWatch(video)} />
        <Badge className="pointer-events-none absolute left-3 top-3 gap-1 border border-teal/30 bg-[rgba(13,12,20,0.76)] text-[10px] uppercase tracking-[0.14em] text-[#a6ffff]">
          Public
        </Badge>
      </div>

      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-[var(--text-primary)]">{video.title}</h3>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Posted by {video.creator}
            </p>
          </div>
          <PlayCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary/80" aria-hidden="true" />
        </div>

        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-[var(--text-muted)]">
          {video.description || 'No description provided.'}
        </p>

        {video.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {video.tags.map((tag) => (
              <span
                key={`${video.id}-${tag}`}
                className="rounded-full border border-[var(--border-subtle)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <MemberGateControls isAuthenticated={isAuthenticated} onAction={onMemberAction} compact />

        <Button
          type="button"
          variant="ghost"
          onClick={() => onWatch(video)}
          className="group/watch min-h-10 w-full justify-between rounded-xl border-t border-[var(--border-subtle)] px-1 pt-3 text-xs uppercase tracking-[0.14em] text-[var(--text-primary)] hover:bg-transparent hover:text-primary"
        >
          <span className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            Watch
          </span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover/watch:translate-x-0.5" aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  )
}
