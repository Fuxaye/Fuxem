import { describe, expect, it } from 'vitest'

import { getAdminToolsSections } from '../src/lib/admin-tools'

describe('getAdminToolsSections', () => {
  it('returns full moderation sections for supreme admins', () => {
    const sections = getAdminToolsSections('SUPREME_ADMIN')

    expect(sections.map((section) => section.id)).toEqual(['reports', 'members', 'audit', 'dashboard-access'])
    expect(sections.find((section) => section.id === 'dashboard-access')?.title).toBe('Dashboard Access')
  })

  it('excludes privileged controls for regular admins', () => {
    const sections = getAdminToolsSections('ADMIN')

    expect(sections.map((section) => section.id)).toEqual(['reports', 'members', 'audit'])
  })
})
