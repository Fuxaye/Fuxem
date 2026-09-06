export type PublicVideoVisibilityRecord = {
  isPublic: boolean
  user: {
    role: string
    status: string
  }
}

export function isEligiblePublicVideo(video: PublicVideoVisibilityRecord): boolean {
  return video.isPublic && video.user.role === 'MODEL_VERIFIED' && video.user.status === 'active'
}
