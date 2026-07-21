'use client'

import React from 'react'

type ChatRoom = {
  id: string
  name: string
  type: string
  createdAt: string
  updatedAt: string
}

type ChatMessage = {
  id: string
  roomId: string
  senderId: string
  senderName: string
  body: string
  createdAt: string
}

type ChatroomClientProps = {
  currentUserId: string
}

export default function ChatroomClient({ currentUserId }: ChatroomClientProps) {
  const [rooms, setRooms] = React.useState<ChatRoom[]>([])
  const [activeRoomId, setActiveRoomId] = React.useState<string>('')
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [newRoomName, setNewRoomName] = React.useState('')
  const [newMessage, setNewMessage] = React.useState('')
  const [loadingRooms, setLoadingRooms] = React.useState(true)
  const [loadingMessages, setLoadingMessages] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState('')

  const activeRoom = React.useMemo(
    () => rooms.find((room) => room.id === activeRoomId) || null,
    [rooms, activeRoomId]
  )

  const loadRooms = React.useCallback(async () => {
    setLoadingRooms(true)
    setError('')

    try {
      const response = await fetch('/api/chatroom/rooms', { cache: 'no-store' })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Could not load rooms')
      }

      const nextRooms = payload.rooms as ChatRoom[]
      setRooms(nextRooms)

      if (!activeRoomId && nextRooms.length > 0) {
        setActiveRoomId(nextRooms[0].id)
      }

      if (activeRoomId && !nextRooms.some((room) => room.id === activeRoomId)) {
        setActiveRoomId(nextRooms[0]?.id || '')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load rooms')
    } finally {
      setLoadingRooms(false)
    }
  }, [activeRoomId])

  const loadMessages = React.useCallback(async (roomId: string) => {
    if (!roomId) {
      setMessages([])
      return
    }

    setLoadingMessages(true)
    setError('')

    try {
      const response = await fetch(`/api/chatroom/rooms/${roomId}/messages?limit=100`, { cache: 'no-store' })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Could not load messages')
      }

      setMessages(payload.messages as ChatMessage[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load messages')
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  React.useEffect(() => {
    void loadRooms()
  }, [loadRooms])

  React.useEffect(() => {
    if (!activeRoomId) {
      setMessages([])
      return
    }

    void loadMessages(activeRoomId)

    const intervalId = window.setInterval(() => {
      void loadMessages(activeRoomId)
    }, 3000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [activeRoomId, loadMessages])

  async function createRoom() {
    const name = newRoomName.trim()

    if (name.length < 2) {
      setError('Room name must be at least 2 characters.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/chatroom/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type: 'public' }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Could not create room')
      }

      const room = payload.room as ChatRoom
      setRooms((prev) => [room, ...prev])
      setActiveRoomId(room.id)
      setNewRoomName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create room')
    } finally {
      setSubmitting(false)
    }
  }

  async function sendMessage() {
    const body = newMessage.trim()

    if (!activeRoomId) {
      setError('Pick a room first.')
      return
    }

    if (!body) {
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/chatroom/rooms/${activeRoomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Could not send message')
      }

      const message = payload.message as ChatMessage
      setMessages((prev) => [...prev, message])
      setNewMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 md:grid-cols-[300px_1fr] md:px-6">
      <section className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
        <h1 className="text-lg font-semibold text-white">Chatroom</h1>
        <p className="mt-1 text-xs text-stone-400">Create or join a room and start chatting.</p>

        <div className="mt-4 flex gap-2">
          <input
            value={newRoomName}
            onChange={(event) => setNewRoomName(event.target.value)}
            placeholder="New room name"
            className="flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder-stone-500"
          />
          <button
            type="button"
            onClick={() => void createRoom()}
            disabled={submitting}
            className="rounded-lg border border-cyan-300/30 bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-100 disabled:opacity-60"
          >
            Create
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {loadingRooms && <p className="text-xs text-stone-500">Loading rooms...</p>}
          {!loadingRooms && rooms.length === 0 && (
            <p className="text-xs text-stone-500">No rooms yet. Create one.</p>
          )}
          {rooms.map((room) => {
            const isActive = room.id === activeRoomId

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => setActiveRoomId(room.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                  isActive
                    ? 'border-cyan-300/40 bg-cyan-500/15 text-cyan-100'
                    : 'border-white/10 bg-white/[0.03] text-stone-200 hover:border-white/25'
                }`}
              >
                <p className="truncate text-sm font-medium">{room.name}</p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-stone-500">{room.type}</p>
              </button>
            )
          })}
        </div>
      </section>

      <section className="flex min-h-[500px] flex-col rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
        <div className="border-b border-white/10 pb-3">
          <p className="text-sm font-semibold text-white">{activeRoom ? activeRoom.name : 'Select a room'}</p>
          <p className="text-xs text-stone-400">Real messages with auto-refresh.</p>
        </div>

        <div className="mt-3 flex-1 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-3">
          {loadingMessages && <p className="text-xs text-stone-500">Loading messages...</p>}
          {!loadingMessages && activeRoomId && messages.length === 0 && (
            <p className="text-xs text-stone-500">No messages yet. Say hello.</p>
          )}
          {!activeRoomId && <p className="text-xs text-stone-500">Pick a room from the left panel.</p>}

          {messages.map((message) => {
            const isMine = message.senderId === currentUserId

            return (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-lg border px-3 py-2 text-sm ${
                  isMine
                    ? 'ml-auto border-cyan-300/30 bg-cyan-500/15 text-cyan-50'
                    : 'border-white/10 bg-white/[0.03] text-stone-200'
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">
                  {message.senderName}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void sendMessage()
              }
            }}
            disabled={!activeRoomId || submitting}
            placeholder={activeRoomId ? 'Type message and press Enter' : 'Select a room first'}
            className="flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder-stone-500 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!activeRoomId || submitting}
            className="rounded-lg border border-emerald-300/30 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 disabled:opacity-60"
          >
            Send
          </button>
        </div>

        {error && (
          <p className="mt-2 rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
            {error}
          </p>
        )}
      </section>
    </div>
  )
}
