import type { UserRole } from '@prisma/client'

type AdminToolsSection = {
  id: 'reports' | 'members' | 'audit' | 'dashboard-access'
  title: string
  description: string
  href: string
}

export function getAdminToolsSections(role: UserRole | null | undefined): AdminToolsSection[] {
  const baseSections: AdminToolsSection[] = [
    {
      id: 'reports',
      title: 'Reports Queue',
      description: 'Review incoming safety reports and resolve them with notes.',
      href: '/admin#reports',
    },
    {
      id: 'members',
      title: 'Member Controls',
      description: 'Suspend accounts, restore access, and inspect member signals.',
      href: '/admin#members',
    },
    {
      id: 'audit',
      title: 'Audit Log',
      description: 'Review recent administrative actions for accountability.',
      href: '/admin#audit',
    },
  ]

  if (role === 'SUPREME_ADMIN') {
    return [
      ...baseSections,
      {
        id: 'dashboard-access',
        title: 'Dashboard Access',
        description: 'Grant or revoke direct dashboard access for trusted staff members.',
        href: '/admin#members',
      },
    ]
  }

  return baseSections
}
