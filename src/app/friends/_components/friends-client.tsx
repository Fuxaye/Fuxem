'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import MemberLayout from '@/app/_layouts/member-layout'
import { decideFriendRequest, fetchFriendRequests, fetchFriends } from '@/lib/api'
import { ROUTES } from '@/lib/constants'
import type { FriendListMember, PendingFriendRequest } from '@/lib/types'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function MemberAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-2xl border border-white/20 object-cover" />
    )
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-amber-500/20 text-sm font-semibold text-amber-100">
      {initials(name)}
    </div>
  )
}

export default function FriendsClient() {
  const [friends, setFriends] = useState<FriendListMember[]>([])
  const [incoming, setIncoming] = useState<PendingFriendRequest[]>([])
  const [outgoing, setOutgoing] = useState<PendingFriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const [friendData, requestData] = await Promise.all([
          fetchFriends(controller.signal),
          fetchFriendRequests(controller.signal),
        ])
        setFriends(friendData.friends)
        setIncoming(requestData.incoming)
        setOutgoing(requestData.outgoing)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unable to load friends.')
      } finally {
        setLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [])

  async function handleDecision(friendshipId: string, action: 'accept' | 'decline' | 'cancel') {
    setPendingId(friendshipId)
    setNotice('')
    setError('')
    try {
      await decideFriendRequest(friendshipId, action)
      if (action === 'cancel') {
        setOutgoing((current) => current.filter((request) => request.id !== friendshipId))
        setNotice('Friend request cancelled.')
      } else if (action === 'accept') {
        const accepted = incoming.find((request) => request.id === friendshipId)
        setIncoming((current) => current.filter((request) => request.id !== friendshipId))
        if (accepted) {
          setFriends((current) => [
            {
              friendshipId: accepted.id,
              id: accepted.member.id,
              username: accepted.member.username,
              displayName: accepted.member.displayName,
              avatarUrl: accepted.member.avatarUrl,
            },
            ...current,
          ])
        }
        setNotice('Friend request accepted.')
      } else {
        setIncoming((current) => current.filter((request) => request.id !== friendshipId))
        setNotice('Friend request declined.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update friend request.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <MemberLayout>
      <div className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
        <main className="space-y-5">
          <header className="ui-shell-panel p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Members</p>
            <h1 className="mt-2 font-[family:var(--font-heading)] text-3xl text-text-primary">Friends</h1>
            <p className="mt-2 text-sm text-text-muted">
              {loading ? 'Loading…' : `${friends.length} friends · ${incoming.length} incoming · ${outgoing.length} sent`}
            </p>
          </header>

          {error ? (
            <p className="rounded-xl border border-rose-400/35 bg-rose-500/20 p-4 text-sm text-rose-100">{error}</p>
          ) : null}
          {notice ? (
            <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-stone-200">{notice}</p>
          ) : null}

          <section className="ui-shell-panel p-4 sm:p-5">
            <h2 className="font-[family:var(--font-heading)] text-2xl text-text-primary">Requests</h2>
            {!loading && incoming.length === 0 && outgoing.length === 0 ? (
              <p className="mt-3 text-sm text-text-muted">No pending requests.</p>
            ) : null}
            <ul className="mt-4 space-y-3">
              {incoming.map((request) => (
                <li key={request.id} className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-bg-card/70 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <MemberAvatar name={request.member.displayName || request.member.username} avatarUrl={request.member.avatarUrl} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text-primary">{request.member.displayName}</p>
                      <p className="text-sm text-text-muted">@{request.member.username} wants to connect</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" disabled={pendingId === request.id} onClick={() => void handleDecision(request.id, 'accept')} className="rounded-xl bg-[#7C5CFC] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">
                      Accept
                    </button>
                    <button type="button" disabled={pendingId === request.id} onClick={() => void handleDecision(request.id, 'decline')} className="rounded-xl border border-border-subtle px-3 py-2 text-xs text-text-primary disabled:opacity-60">
                      Decline
                    </button>
                  </div>
                </li>
              ))}
              {outgoing.map((request) => (
                <li key={request.id} className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-bg-card/70 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <MemberAvatar name={request.member.displayName || request.member.username} avatarUrl={request.member.avatarUrl} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text-primary">{request.member.displayName}</p>
                      <p className="text-sm text-text-muted">@{request.member.username} · request sent</p>
                    </div>
                  </div>
                  <button type="button" disabled={pendingId === request.id} onClick={() => void handleDecision(request.id, 'cancel')} className="rounded-xl border border-border-subtle px-3 py-2 text-xs text-text-primary disabled:opacity-60">
                    Cancel
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="ui-shell-panel p-4 sm:p-5">
            <h2 className="font-[family:var(--font-heading)] text-2xl text-text-primary">Your friends</h2>
            {!loading && friends.length === 0 ? (
              <p className="mt-3 text-sm text-text-muted">
                No friends yet. Find members in <Link href={ROUTES.SEARCH} className="underline underline-offset-2">search</Link>.
              </p>
            ) : null}
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {friends.map((friend) => (
                <li key={friend.friendshipId} className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-bg-card/70 p-4">
                  <MemberAvatar name={friend.displayName || friend.username} avatarUrl={friend.avatarUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-text-primary">{friend.displayName}</p>
                    <p className="text-sm text-text-muted">@{friend.username}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/u/${friend.username}`} className="text-xs text-text-primary underline underline-offset-2">Profile</Link>
                    <Link href={`${ROUTES.MESSAGES}/${friend.id}`} className="text-xs text-text-primary underline underline-offset-2">Message</Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </MemberLayout>
  )
}
