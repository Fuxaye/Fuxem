import { describe, expect, it, vi, afterEach } from 'vitest'

import {
  getMaximumBirthDateIso,
  isIsoDateOfBirthOldEnough,
  parseIsoDateOfBirth,
} from '../src/lib/dob'

describe('date of birth validation', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('rejects invalid and underage dates', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-05T12:00:00.000Z'))

    expect(parseIsoDateOfBirth('not-a-date')).toBeNull()
    expect(parseIsoDateOfBirth('2026-13-01')).toBeNull()
    expect(isIsoDateOfBirthOldEnough('2020-01-01')).toBe(false)
    expect(isIsoDateOfBirthOldEnough('2007-11-05')).toBe(true)
  })

  it('computes max birth date from UTC today', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-05T12:00:00.000Z'))

    expect(getMaximumBirthDateIso(19)).toBe('2007-11-05')
  })
})
