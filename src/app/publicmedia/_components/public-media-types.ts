import type { PublicMediaVideo } from '@/lib/types'

export type PublicMediaDialog = 'watch' | 'member-access' | null
export type MemberAction = 'save' | 'react'

export type PublicMediaClientProps = {
  videos: PublicMediaVideo[]
  isAuthenticated: boolean
  initialError: string | null
}

export type PublicVideoTileProps = {
  video: PublicMediaVideo
  isAuthenticated: boolean
  onWatch: (video: PublicMediaVideo) => void
  onMemberAction: (action: MemberAction) => void
}
