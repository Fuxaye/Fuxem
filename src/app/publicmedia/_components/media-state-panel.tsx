import { AlertTriangle, Film } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type MediaStatePanelProps = {
  kind: 'empty' | 'no-match' | 'error' | 'placeholder'
  message?: string
  detail?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const stateCopy = {
  empty: {
    title: 'No public videos are available right now.',
    detail: 'Check back for the next member drop.',
  },
  'no-match': {
    title: 'No public videos match these filters.',
    detail: 'Try another search or clear the current filters.',
  },
  error: {
    title: 'This preview can’t be loaded here.',
    detail: 'Try again without changing your member access.',
  },
  placeholder: {
    title: 'Preview unavailable',
    detail: 'Public playback is not available for this upload yet.',
  },
} as const

export default function MediaStatePanel({
  kind,
  message,
  detail,
  actionLabel,
  onAction,
  className,
}: MediaStatePanelProps) {
  const copy = stateCopy[kind]
  const isError = kind === 'error'

  return (
    <Card
      role={isError ? 'alert' : undefined}
      className={cn(
        'rounded-2xl border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.18)]',
        className
      )}
    >
      {isError ? (
        <AlertTriangle className="mx-auto h-6 w-6 text-secondary" aria-hidden="true" />
      ) : (
        <Film className="mx-auto h-6 w-6 text-primary/80" aria-hidden="true" />
      )}
      <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{message || copy.title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">{detail || copy.detail}</p>
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" size="sm" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  )
}
