import { Bookmark, Heart, LockKeyhole } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { MemberAction } from './public-media-types'

type MemberGateControlsProps = {
  isAuthenticated: boolean
  onAction: (action: MemberAction) => void
  compact?: boolean
}

export default function MemberGateControls({
  isAuthenticated,
  onAction,
  compact = false,
}: MemberGateControlsProps) {
  return (
    <div className={compact ? 'flex flex-wrap gap-2' : 'grid gap-2 sm:grid-cols-2'}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onAction('save')}
        className="min-h-10 gap-2 border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-xs text-[var(--text-primary)] hover:border-primary/50"
        aria-label={isAuthenticated ? 'Save video' : 'Save video, members only'}
      >
        <Bookmark className="h-4 w-4" aria-hidden="true" />
        {isAuthenticated ? 'Save' : 'Save · members'}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onAction('react')}
        className="min-h-10 gap-2 border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-xs text-[var(--text-primary)] hover:border-primary/50"
        aria-label={isAuthenticated ? 'React to video' : 'React to video, members only'}
      >
        <Heart className="h-4 w-4" aria-hidden="true" />
        {isAuthenticated ? 'React' : 'React · members'}
      </Button>
      {!isAuthenticated ? (
        <p className="flex items-center gap-1.5 text-[11px] text-secondary sm:col-span-2">
          <LockKeyhole className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Member access required
        </p>
      ) : null}
    </div>
  )
}
