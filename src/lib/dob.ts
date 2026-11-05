import { MIN_AGE } from './constants'

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/** Parse `YYYY-MM-DD` as UTC midnight (matches register API). */
export function parseIsoDateOfBirth(value: unknown): Date | null {
  if (typeof value !== 'string' || !ISO_DATE_REGEX.test(value)) {
    return null
  }

  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const [year, month, day] = value.split('-').map(Number)
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return date
}

export function calculateAgeUtc(dateOfBirth: Date): number {
  const now = new Date()
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear()
  const monthDifference = now.getUTCMonth() - dateOfBirth.getUTCMonth()
  const dayDifference = now.getUTCDate() - dateOfBirth.getUTCDate()

  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age -= 1
  }

  return age
}

export function isAtLeastMinimumAge(dateOfBirth: Date, minimumAge: number = MIN_AGE): boolean {
  return calculateAgeUtc(dateOfBirth) >= minimumAge
}

export function isIsoDateOfBirthOldEnough(value: string, minimumAge: number = MIN_AGE): boolean {
  const parsed = parseIsoDateOfBirth(value)
  if (!parsed) {
    return false
  }
  return isAtLeastMinimumAge(parsed, minimumAge)
}

/** Latest birth date still at least `minimumAge` (for `<input type="date" max>`). */
export function getMaximumBirthDateIso(minimumAge: number = MIN_AGE): string {
  const today = new Date()
  const cutoff = new Date(
    Date.UTC(today.getUTCFullYear() - minimumAge, today.getUTCMonth(), today.getUTCDate())
  )
  const year = cutoff.getUTCFullYear()
  const month = String(cutoff.getUTCMonth() + 1).padStart(2, '0')
  const day = String(cutoff.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
