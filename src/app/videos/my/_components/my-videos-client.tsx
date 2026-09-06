'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Eye,
  Film,
  Loader2,
  LockKeyhole,
  PlayCircle,
  Trash2,
  Upload,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { createVideo, deleteVideo, fetchMyVideos, updateVideo } from '@/lib/api'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { VideoFeedItem } from '@/lib/types'

const surfaceClass = 'border-[var(--border-subtle)] bg-[rgba(13,12,20,0.78)] shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl'
const fieldClass = 'mt-2 min-h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[rgba(30,28,46,0.88)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60'
const quietButtonClass = 'border-[var(--border-strong)] bg-[rgba(30,28,46,0.84)] text-[var(--text-primary)] hover:border-primary/50 hover:bg-[rgba(45,41,68,0.95)]'

function FeedbackMessage({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  const isError = tone === 'error'

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={cn(
        'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm',
        isError
          ? 'border-rose-300/30 bg-rose-500/10 text-rose-100'
          : 'border-emerald-300/30 bg-emerald-500/10 text-emerald-100'
      )}
    >
      {isError ? <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />}
      <p className="leading-5">{children}</p>
    </div>
  )
}

function VideoCard({
  video,
  pendingId,
  onTogglePublic,
  onDelete,
}: {
  video: VideoFeedItem
  pendingId: string | null
  onTogglePublic: (video: VideoFeedItem) => void
  onDelete: (videoId: string) => void
}) {
  const isPending = pendingId === video.id

  return (
    <Card className={cn(surfaceClass, 'group overflow-hidden rounded-2xl transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_24px_70px_rgba(124,92,252,0.16)]')}>
      <div className="relative aspect-video overflow-hidden bg-[rgba(30,28,46,0.75)]">
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnailUrl}
            alt={`${video.title} thumbnail`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--text-muted)]">
            <Film className="h-7 w-7 text-primary/70" aria-hidden="true" />
            <span className="text-xs uppercase tracking-[0.16em]">No thumbnail</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/75 via-black/10 to-transparent p-4">
          <Badge
            variant="outline"
            className={cn(
              'gap-1.5 border text-[10px] uppercase tracking-[0.14em] backdrop-blur-md',
              video.isPublic
                ? 'border-teal/40 bg-teal/15 text-[#a6ffff]'
                : 'border-white/20 bg-black/45 text-stone-200'
            )}
          >
            {video.isPublic ? <Eye className="h-3 w-3" aria-hidden="true" /> : <LockKeyhole className="h-3 w-3" aria-hidden="true" />}
            {video.isPublic ? 'Public' : 'Private'}
          </Badge>
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-md">
            {video.views} views
          </span>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-[var(--text-primary)]">{video.title}</h3>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[var(--text-muted)]">
              {video.description || 'No description provided.'}
            </p>
          </div>
          <PlayCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary/80" aria-hidden="true" />
        </div>

        {video.isPublic && video.publicAliasPath ? (
          <p className="mt-4 break-all rounded-xl border border-teal/25 bg-teal/10 px-3 py-2 text-[11px] leading-4 text-[#a6ffff]">
            <span className="font-semibold uppercase tracking-[0.12em]">Alias</span> · {video.publicAliasPath}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border-subtle)] pt-4">
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'min-h-11 gap-2 px-3 text-xs', quietButtonClass)}
          >
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            Open
          </a>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onTogglePublic(video)}
            disabled={isPending}
            className={cn(
              'min-h-11 gap-2 px-3 text-xs',
              video.isPublic
                ? 'border border-amber-200/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20'
                : 'border border-teal/30 bg-teal/10 text-[#a6ffff] hover:bg-teal/20'
            )}
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : video.isPublic ? <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
            {isPending ? 'Saving...' : video.isPublic ? 'Make Private' : 'Make Public'}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(video.id)}
            disabled={isPending}
            className="min-h-11 gap-2 border border-rose-300/30 bg-rose-500/10 px-3 text-xs text-rose-100 hover:bg-rose-500/20"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
            {isPending ? 'Working...' : 'Delete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function VideoCardSkeleton() {
  return (
    <Card className={cn(surfaceClass, 'overflow-hidden rounded-2xl')} aria-hidden="true">
      <Skeleton className="aspect-video rounded-none bg-white/5" />
      <CardContent className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/3 bg-white/5" />
        <Skeleton className="h-10 w-full bg-white/5" />
        <div className="flex gap-2 border-t border-[var(--border-subtle)] pt-4">
          <Skeleton className="h-10 w-20 bg-white/5" />
          <Skeleton className="h-10 w-28 bg-white/5" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function MyVideosClient() {
  const [videos, setVideos] = useState<VideoFeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [ownershipCertified, setOwnershipCertified] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadVideos() {
      try {
        setIsLoading(true)
        setError('')
        const response = await fetchMyVideos(controller.signal)
        setVideos(response.videos)
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unable to load your videos.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadVideos()

    return () => controller.abort()
  }, [])

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError('')
      setSuccess('')

      const response = await createVideo({
        title,
        description,
        videoUrl,
        thumbnailUrl,
        isPublic,
        ownershipCertified,
      })

      setVideos((current) => [response.video, ...current])
      setTitle('')
      setDescription('')
      setVideoUrl('')
      setThumbnailUrl('')
      setIsPublic(false)
      setOwnershipCertified(false)
      setSuccess('Video uploaded successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload video.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleTogglePublic(video: VideoFeedItem) {
    try {
      setPendingId(video.id)
      setError('')
      setSuccess('')

      const response = await updateVideo(video.id, {
        isPublic: !video.isPublic,
        ...(video.isPublic ? {} : { ownershipCertified: true }),
      })

      setVideos((current) =>
        current.map((item) => (item.id === response.video.id ? response.video : item))
      )

      setSuccess(response.video.isPublic ? 'Video is now public.' : 'Video is now private.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update visibility.')
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete(videoId: string) {
    try {
      setPendingId(videoId)
      setError('')
      setSuccess('')

      await deleteVideo(videoId)
      setVideos((current) => current.filter((video) => video.id !== videoId))
      setSuccess('Video deleted.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete video.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <Card className={cn(surfaceClass, 'relative overflow-hidden rounded-3xl border-[var(--border-strong)]')}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(124,92,252,0.2),transparent_35%),radial-gradient(circle_at_10%_90%,rgba(61,207,207,0.1),transparent_35%)]" />
        <div className="relative p-5 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary/90">Video library</p>
              <h1
                id="video-vault-title"
                className="mt-2 max-w-full overflow-hidden bg-[radial-gradient(ellipse,_rgb(228_228_231)_0%,_rgb(0_0_0)_100%)] bg-clip-text text-ellipsis whitespace-nowrap text-3xl font-[family:var(--font-display)] font-medium uppercase leading-tight tracking-[0.02em] text-transparent sm:text-4xl"
              >
                My Video Vault
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                Post your clips and control whether each one is visible in the public stream.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Link
                href={ROUTES.PUBLIC_STREAM}
                className={cn(buttonVariants({ variant: 'outline', size: 'default' }), 'min-h-11 gap-2 px-4 text-xs uppercase tracking-[0.12em]', quietButtonClass)}
              >
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                Watch Stream
              </Link>
              <Badge variant="outline" className="min-h-11 gap-2 border-teal/30 bg-teal/10 px-3 text-[10px] uppercase tracking-[0.12em] text-[#a6ffff]">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Verified model
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card id="post-video" className={cn(surfaceClass, 'mt-6 rounded-3xl')}>
        <CardHeader className="gap-2 p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
              <Upload className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">Create from the vault</p>
              <CardTitle id="post-video-title" className="mt-1 text-xl text-[var(--text-primary)]">Post a video</CardTitle>
              <CardDescription className="mt-2 max-w-2xl leading-5 text-[var(--text-muted)]">
                Add a hosted clip, then decide whether it belongs in the public stream.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-5 sm:px-7 sm:pb-7">
          <form className="grid grid-cols-1 gap-5 md:grid-cols-2" onSubmit={handleCreate} aria-labelledby="post-video-title">
            <div>
              <Label htmlFor="video-title" className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Title <span aria-hidden="true" className="text-secondary">*</span>
              </Label>
              <Input
                id="video-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                aria-describedby="video-title-help"
                className={fieldClass}
                placeholder="Late Night Dance Session"
              />
              <p id="video-title-help" className="mt-2 text-xs leading-4 text-[var(--text-muted)]">Give the clip a clear, memorable name.</p>
            </div>

            <div>
              <Label htmlFor="video-url" className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Video URL <span aria-hidden="true" className="text-secondary">*</span>
              </Label>
              <Input
                id="video-url"
                type="url"
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                required
                aria-describedby="video-url-help"
                className={fieldClass}
                placeholder="https://..."
              />
              <p id="video-url-help" className="mt-2 text-xs leading-4 text-[var(--text-muted)]">Use the hosted URL viewers should open.</p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="video-description" className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Description</Label>
              <textarea
                id="video-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                aria-describedby="video-description-help"
                className={cn(fieldClass, 'resize-y')}
                placeholder="What should viewers know before opening this clip?"
              />
              <p id="video-description-help" className="mt-2 text-xs leading-4 text-[var(--text-muted)]">Optional context helps viewers know what to expect.</p>
            </div>

            <div>
              <Label htmlFor="thumbnail-url" className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Thumbnail URL</Label>
              <Input
                id="thumbnail-url"
                type="url"
                value={thumbnailUrl}
                onChange={(event) => setThumbnailUrl(event.target.value)}
                aria-describedby="thumbnail-url-help"
                className={fieldClass}
                placeholder="https://..."
              />
              <p id="thumbnail-url-help" className="mt-2 text-xs leading-4 text-[var(--text-muted)]">Optional poster image for the library card.</p>
            </div>

            <fieldset className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(30,28,46,0.45)] p-4 md:col-span-2">
              <legend className="px-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Publishing</legend>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <label htmlFor="ownership-certified" className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[rgba(13,12,20,0.4)] px-4 py-3 text-sm text-[var(--text-primary)] transition hover:border-primary/35">
                  <input
                    id="ownership-certified"
                    type="checkbox"
                    checked={ownershipCertified}
                    onChange={(event) => setOwnershipCertified(event.target.checked)}
                    aria-describedby="publishing-help"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <span className="leading-5">I certify this video belongs to me and I have the rights to publish it.</span>
                </label>
                <label htmlFor="video-public" className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[rgba(13,12,20,0.4)] px-4 py-3 text-sm text-[var(--text-primary)] transition hover:border-primary/35">
                  <input
                    id="video-public"
                    type="checkbox"
                    checked={isPublic}
                    onChange={(event) => setIsPublic(event.target.checked)}
                    aria-describedby="publishing-help"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <span className="leading-5">
                    <span className="font-semibold">Make public</span>
                    <span className="mt-0.5 block text-xs text-[var(--text-muted)]">Show this clip in the public stream.</span>
                  </span>
                </label>
              </div>
              <p id="publishing-help" className={cn('mt-3 text-xs leading-5', isPublic && !ownershipCertified ? 'text-amber-200' : 'text-[var(--text-muted)]')}>
                {isPublic && !ownershipCertified
                  ? 'Ownership certification is required before this video can be published publicly.'
                  : 'Private videos stay in your vault until you choose to publish them.'}
              </p>
            </fieldset>

            <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-4 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-[var(--text-muted)]"><span aria-hidden="true" className="text-secondary">*</span> Required fields</p>
              <Button
                type="submit"
                disabled={isSubmitting || (isPublic && !ownershipCertified)}
                className="min-h-11 w-full gap-2 px-5 text-xs uppercase tracking-[0.14em] sm:w-auto"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
                {isSubmitting ? 'Posting...' : 'Post Video'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-5 min-h-[3.5rem]">
        {error ? <FeedbackMessage tone="error">{error}</FeedbackMessage> : null}
        {!error && success ? <FeedbackMessage tone="success">{success}</FeedbackMessage> : null}
      </div>

      <section className="mt-2" aria-labelledby="your-videos-heading">
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">Your collection</p>
            <h2 id="your-videos-heading" className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Your videos</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Manage the clips attached to your account.</p>
          </div>
          <Badge variant="outline" className="w-fit border-[var(--border-strong)] bg-[rgba(30,28,46,0.6)] text-xs text-[var(--text-muted)]">
            {videos.length} {videos.length === 1 ? 'upload' : 'uploads'}
          </Badge>
        </header>

        {isLoading ? (
          <div role="status" aria-label="Loading videos" className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <VideoCardSkeleton />
            <VideoCardSkeleton />
          </div>
        ) : videos.length === 0 ? (
          <Card className={cn(surfaceClass, 'rounded-2xl border-dashed p-6 text-center sm:p-8')}>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
              <Film className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">Your vault is ready</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
              You have not posted any videos yet. Add your first hosted clip above, or explore the public stream for inspiration.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a href="#post-video" className={cn(buttonVariants({ variant: 'default', size: 'default' }), 'min-h-11 gap-2 px-4 text-xs uppercase tracking-[0.12em]')}>
                <Upload className="h-4 w-4" aria-hidden="true" />
                Post your first video
              </a>
              <Link href={ROUTES.PUBLIC_STREAM} className={cn(buttonVariants({ variant: 'outline', size: 'default' }), 'min-h-11 gap-2 px-4 text-xs uppercase tracking-[0.12em]', quietButtonClass)}>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                Watch stream
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                pendingId={pendingId}
                onTogglePublic={(item) => {
                  void handleTogglePublic(item)
                }}
                onDelete={(videoId) => {
                  void handleDelete(videoId)
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
