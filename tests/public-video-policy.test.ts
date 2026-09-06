import { describe, expect, it } from 'vitest'

import { isEligiblePublicVideo } from '../src/lib/public-video-policy'

describe('isEligiblePublicVideo', () => {
  it('allows public videos from active verified model accounts', () => {
    expect(
      isEligiblePublicVideo({
        isPublic: true,
        user: { role: 'MODEL_VERIFIED', status: 'active' },
      })
    ).toBe(true)
  })

  it.each([
    { role: 'MEMBER', status: 'active' },
    { role: 'MODEL_VERIFIED', status: 'suspended' },
    { role: 'MODEL_VERIFIED', status: 'deleted' },
  ])('rejects a public video with an ineligible uploader: $role/$status', (user) => {
    expect(isEligiblePublicVideo({ isPublic: true, user })).toBe(false)
  })

  it('rejects private videos even when the uploader is eligible', () => {
    expect(
      isEligiblePublicVideo({
        isPublic: false,
        user: { role: 'MODEL_VERIFIED', status: 'active' },
      })
    ).toBe(false)
  })
})
