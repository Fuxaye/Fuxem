'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { MEMBER_MENU_ITEMS, ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface MemberLayoutProps {
  children: React.ReactNode
  initialUser?: {
    id?: string
    username: string
    firstName: string
    displayName: string
    accountCategoryLabel?: string
    avatarUrl?: string
    profileHref?: string
  }
  isBurner?: boolean
}

const iconMap: { [key: string]: React.ReactNode } = {
  Dashboard: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Search: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  Community: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Profile: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  'My Profile': (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Settings: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
    </svg>
  ),
  Messages: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Videos: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  Friends: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Camera: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part.trim().slice(0, 1))
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getMemberMenuItems(profileHref?: string) {
  return MEMBER_MENU_ITEMS.map((item) => {
    if (item.label === 'Dashboard' && profileHref) {
      return { ...item, label: 'My Profile', href: profileHref }
    }

    return item
  })
}

function SidebarNav({ profileHref }: { profileHref?: string }) {
  const pathname = usePathname()
  const menuItems = getMemberMenuItems(profileHref)
  const isVideosRoute =
    pathname === ROUTES.PUBLIC_STREAM ||
    pathname === ROUTES.VIDEOS ||
    pathname === ROUTES.MY_VIDEOS ||
    pathname === ROUTES.ME_VIDEOS
  const [isVideosOpen, setIsVideosOpen] = useState(isVideosRoute)

  React.useEffect(() => {
    if (isVideosRoute) {
      setIsVideosOpen(true)
    }
  }, [isVideosRoute])

  return (
    <div className="space-y-6">
      <nav className="space-y-2">
        {menuItems.map((item) => {
        if (item.label === 'Videos') {
          return (
            <div key="videos-dropdown" className="space-y-1">
              <button
                type="button"
                onClick={() => setIsVideosOpen((current) => !current)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all duration-200',
                  isVideosRoute
                    ? 'border border-primary/30 bg-primary/20 text-primary'
                    : 'text-text-muted hover:bg-bg-surface/50'
                )}
              >
                {iconMap.Videos}
                <span className="text-sm font-medium">Videos</span>
                <ChevronDown className={cn('ml-auto h-4 w-4 transition-transform', isVideosOpen ? 'rotate-180' : '')} />
              </button>

              {isVideosOpen && (
                <div className="space-y-1 pl-5">
                  <Link href={ROUTES.PUBLIC_STREAM}>
                    <div
                      className={cn(
                        'rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-all',
                        pathname === ROUTES.PUBLIC_STREAM || pathname === ROUTES.VIDEOS
                          ? 'bg-primary/20 text-primary'
                          : 'text-text-muted hover:bg-bg-surface/40'
                      )}
                    >
                      Watch Videos
                    </div>
                  </Link>
                  <Link href={ROUTES.MY_VIDEOS}>
                    <div
                      className={cn(
                        'rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-all',
                        pathname === ROUTES.MY_VIDEOS || pathname === ROUTES.ME_VIDEOS
                          ? 'bg-primary/20 text-primary'
                          : 'text-text-muted hover:bg-bg-surface/40'
                      )}
                    >
                      Post Videos
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )
        }

        const isActive = pathname === item.href
        return (
          <Link key={item.href} href={item.href}>
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-text-muted hover:bg-bg-surface/50'
              )}
            >
              {iconMap[item.label] || <div className="h-5 w-5" />}
              <span className="text-sm font-medium">{item.label}</span>
            </motion.div>
          </Link>
        )
        })}
      </nav>

      <div className="rounded-xl border border-border-subtle bg-bg-surface/30 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">Legal</p>
        <div className="mt-3 space-y-1">
          <Link href={ROUTES.LEGAL_TERMS}>
            <div className="rounded-lg px-3 py-2 text-xs font-medium text-text-muted transition-all hover:bg-bg-surface/50 hover:text-text-primary">
              Terms of Service
            </div>
          </Link>
          <Link href={ROUTES.LEGAL_PRIVACY}>
            <div className="rounded-lg px-3 py-2 text-xs font-medium text-text-muted transition-all hover:bg-bg-surface/50 hover:text-text-primary">
              Privacy Policy
            </div>
          </Link>
          <Link href={ROUTES.LEGAL_COMMUNITY_GUIDELINES}>
            <div className="rounded-lg px-3 py-2 text-xs font-medium text-text-muted transition-all hover:bg-bg-surface/50 hover:text-text-primary">
              Community Guidelines
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function MemberLayout({ children, initialUser, isBurner }: MemberLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const pathname = usePathname()
  const safePathname = pathname ?? ROUTES.DASHBOARD
  const router = useRouter()

  // Close sidebar when route changes
  React.useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const menuItems = getMemberMenuItems(initialUser?.profileHref)
  const currentPageTitle = safePathname.startsWith('/usergroup/') && safePathname.endsWith('/main')
    ? 'Member Home'
    : safePathname.startsWith('/usergroup/') && safePathname.endsWith('/profile')
      ? 'My Profile'
      : safePathname === ROUTES.PUBLIC_STREAM || safePathname === ROUTES.VIDEOS || safePathname === ROUTES.MY_VIDEOS
        ? 'Videos'
      : menuItems.find((item) => item.href === safePathname)?.label || 'Dashboard'

  async function handleSignOut() {
    if (isSigningOut) return

    setIsSigningOut(true)

    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Continue with redirect even if API call fails to avoid trapping users.
    }

    router.replace('/welcome')
    router.refresh()
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-base text-text-primary">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url(/3.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(124,92,252,0.15),transparent_42%),radial-gradient(circle_at_85%_20%,rgba(61,207,207,0.12),transparent_40%),linear-gradient(160deg,rgba(13,12,20,0.93)_0%,rgba(13,12,20,0.86)_48%,rgba(13,12,20,0.92)_100%)]" />

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-[280px] shrink-0 border-r border-border-subtle bg-bg-surface/58 backdrop-blur-md md:flex md:flex-col">
          <div className="border-b border-border-subtle p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#9B7BFF] text-sm font-bold text-white shadow-[0_8px_22px_rgba(124,92,252,0.45)]">
                {initialUser ? getInitials(initialUser.displayName || initialUser.firstName) : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {initialUser?.displayName || initialUser?.firstName || 'User'}
                </p>
                <p className="truncate text-xs text-text-muted">
                  @{initialUser?.username || 'username'}
                </p>
                {initialUser?.accountCategoryLabel ? (
                  <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#9C95BC]">
                    {initialUser.accountCategoryLabel}
                  </p>
                ) : null}
                {isBurner && (
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full border border-amber-400/35 bg-amber-400/15 px-2.5 py-0.5 text-xs font-medium text-amber-200">
                      Read-only Mode
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            <SidebarNav profileHref={initialUser?.profileHref} />
          </div>

          <div className="border-t border-border-subtle p-4">
            <Button
              variant="outline"
              className="w-full border-border-subtle bg-bg-card text-xs text-text-primary hover:bg-bg-surface"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-border-subtle bg-bg-surface/58 px-4 py-4 backdrop-blur-md md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-text-primary hover:bg-bg-surface"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <h1 className="text-lg font-semibold text-text-primary">{currentPageTitle}</h1>
            <div className="w-10" />
          </div>

          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden fixed inset-0 bg-black/50 z-30"
                />
                <motion.div
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  className="fixed left-0 top-0 z-40 flex h-full w-80 flex-col border-r border-border-subtle bg-bg-surface/95 shadow-xl backdrop-blur-md md:hidden"
                >
                  <div className="border-b border-border-subtle p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#9B7BFF] text-sm font-bold text-white shadow-[0_8px_22px_rgba(124,92,252,0.45)]">
                        {initialUser ? getInitials(initialUser.displayName || initialUser.firstName) : 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {initialUser?.displayName || initialUser?.firstName || 'User'}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          @{initialUser?.username || 'username'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto p-4">
                    <SidebarNav profileHref={initialUser?.profileHref} />
                  </div>

                  <div className="border-t border-border-subtle p-4">
                    <Button
                      variant="outline"
                      className="w-full border-border-subtle bg-bg-card text-xs text-text-primary hover:bg-bg-surface"
                      size="sm"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto pt-16 md:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
