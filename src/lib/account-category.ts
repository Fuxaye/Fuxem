export type UserRoleLike = 'SUPREME_ADMIN' | 'ADMIN' | 'MODEL_VERIFIED' | 'MEMBER' | 'BURNER'

export type AccountCategory = 'staff' | 'verified-model' | 'member' | 'guest-preview'

const ACCOUNT_CATEGORY_LABELS: Record<AccountCategory, string> = {
  staff: 'Staff',
  'verified-model': 'Verified Models',
  member: 'Members',
  'guest-preview': 'Guests/Preview',
}

export function getAccountCategoryFromRole(role: UserRoleLike | null | undefined): AccountCategory {
  if (role === 'SUPREME_ADMIN' || role === 'ADMIN') {
    return 'staff'
  }

  if (role === 'MODEL_VERIFIED') {
    return 'verified-model'
  }

  if (role === 'BURNER') {
    return 'guest-preview'
  }

  return 'member'
}

export function getAccountCategoryLabel(role: UserRoleLike | null | undefined): string {
  return ACCOUNT_CATEGORY_LABELS[getAccountCategoryFromRole(role)]
}