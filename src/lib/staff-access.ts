import type { UserRole } from '@prisma/client'

export type StaffRole = 'SUPREME_ADMIN' | 'ADMIN'

export function isStaffRole(role: UserRole | null | undefined): role is StaffRole {
  return role === 'SUPREME_ADMIN' || role === 'ADMIN'
}