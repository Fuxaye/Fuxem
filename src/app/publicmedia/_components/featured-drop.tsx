import { Play } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import HostedVideoFrame from './hosted-video-frame'
import MemberGateControls from './member-gate-controls'
import type { MemberAction } from './public-media-types'
import type { PublicMediaVideo } from '@/lib/types'

type FeaturedDropProps = {
  video: PublicMediaVideo
  isAuthenticated: boolean
  onWatch: (video: PublicMediaVideo) => void
  onMemberAction: (action: MemberAction) => void
}

export default function FeaturedDrop({
  video,
  isAuthenticated,
  onWatch,
  onMemberAction,
}: FeaturedDropProps) {
  return (
    <section aria-labelledby="featured-drop-title">
      <Card className="overflow-hidden rounded-2xl border-[var(--border-strong)] bg-[var(--bg-card)] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="relative border-b border-[var(--border-subtle)] p-2 sm:p-3">
          <HostedVideoFrame video={video} featured />
          <span className="pointer-events-none absolute left-5 top-5 h-5 w-5 border-l border-t border-primary/80" aria-hidden="true" />
          <span className="pointer-events-none absolute bottom-5 right-5 h-5 w-5 border-b border-r border-teal/80" aria-hidden="true" />
        </div>

        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_12rem] lg:items-end">
          <div>
            <Badge variant="outline" className="border-teal/30 bg-teal/10 font-mono text-[10px] uppercase tracking-[0.14em] text-[#a6ffff]">
              Featured public drop
            </Badge>
            <h2 id="featured-drop-title" className="mt-3 font-[family:var(--font-heading-family)] text-2xl leading-tight text-[var(--text-primary)] sm:text-3xl">
              {video.title}
            </h2>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Posted by {video.creator}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-muted)]">
              {video.description || 'No description provided.'}
            </p>
          </div>

          <div className="space-y-3">
            <Button type="button" onClick={() => onWatch(video)} className="min-h-11 w-full gap-2 text-xs uppercase tracking-[0.12em]">
              <Play className="h-4 w-4" fill="currentColor" aria-hidden="true" />
              Watch
            </Button>
            <MemberGateControls isAuthenticated={isAuthenticated} onAction={onMemberAction} />
          </div>
        </div>
      </Card>
    </section>
  )
}
