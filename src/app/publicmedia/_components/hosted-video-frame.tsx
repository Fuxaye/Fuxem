'use client'

import { useEffect, useState } from 'react'
import { Play, PlayCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { PublicMediaVideo } from '@/lib/types'

import MediaStatePanel from './media-state-panel'

type HostedVideoFrameProps = {
  video: PublicMediaVideo
  featured?: boolean
  dialog?: boolean
  onSelect?: () => void
}

export default function HostedVideoFrame({
  video,
  featured = false,
  dialog = false,
  onSelect,
}: HostedVideoFrameProps) {
  const [hasPlaybackError, setHasPlaybackError] = useState(false)

  useEffect(() => {
    setHasPlaybackError(false)
  }, [video.id])

  if (!video.playbackUrl) {
    return (
      <div className="aspect-video bg-[var(--bg-surface)] p-3">
        <MediaStatePanel kind="placeholder" className="flex h-full items-center justify-center p-4" />
      </div>
    )
  }

  if (hasPlaybackError) {
    return (
      <div className="aspect-video bg-[var(--bg-surface)] p-3">
        <MediaStatePanel
          kind="error"
          className="flex h-full flex-col items-center justify-center p-4"
          actionLabel="Open video"
          onAction={() => window.open(video.playbackUrl || '', '_blank', 'noopener,noreferrer')}
        />
      </div>
    )
  }

  if (!featured && !dialog) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="group relative block aspect-video w-full overflow-hidden bg-black text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        aria-label={`Watch ${video.title}`}
      >
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnailUrl}
            alt={`${video.title} preview`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(124,92,252,0.18),transparent_60%),var(--bg-surface)]">
            <PlayCircle className="h-10 w-10 text-primary/80" aria-hidden="true" />
          </div>
        )}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 pt-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/80">Public viewing</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-white transition group-hover:text-primary">
            <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
            Watch
          </span>
        </span>
      </button>
    )
  }

  return (
    <video
      key={`${video.id}-${dialog ? 'dialog' : 'featured'}`}
      controls
      preload={featured ? 'metadata' : 'none'}
      poster={video.thumbnailUrl || undefined}
      className={cn('h-full w-full bg-black object-contain', dialog ? 'max-h-[70vh]' : 'aspect-video')}
      onError={() => setHasPlaybackError(true)}
      aria-label={video.title}
    >
      <source src={video.playbackUrl} />
      Your browser does not support the video element.
    </video>
  )
}
