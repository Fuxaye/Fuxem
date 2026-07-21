'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ConnectionState,
  LocalAudioTrack,
  LocalVideoTrack,
  Room,
  RoomEvent,
  Track,
  createLocalAudioTrack,
  createLocalVideoTrack,
} from 'livekit-client'

import { Button } from '@/components/ui/button'

type CamMode = 'public' | 'direct'
type CamIntent = 'broadcast' | 'join'

type HostState = {
  token: string
  roomName: string
  livekitUrl: string
  role: 'host' | 'viewer'
  participantName: string
  participantIdentity: string
  accountName: string
  mode?: CamMode
  intent?: CamIntent
  inviteUrl?: string
  category?: string
  locationBadge?: string
  peerAccountName?: string | null
}

type ChatMessage = {
  id: string
  sender: string
  text: string
  timestamp: string
}

const CATEGORY_OPTIONS = ['General', 'Flirty', 'Kink-friendly', 'After Hours']

export default function CameraClient() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const roomRef = useRef<Room | null>(null)
  const localVideoTrackRef = useRef<LocalVideoTrack | null>(null)
  const localAudioTrackRef = useRef<LocalAudioTrack | null>(null)

  const [hostState, setHostState] = useState<HostState | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected)
  const [isHosting, setIsHosting] = useState(false)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [participantCount, setParticipantCount] = useState(0)
  const [error, setError] = useState('')
  const [viewerNote, setViewerNote] = useState('')
  const [remoteParticipants, setRemoteParticipants] = useState<Array<{ identity: string; name: string }>>([])
  const [mode, setMode] = useState<CamMode>('public')
  const [intent, setIntent] = useState<CamIntent>('broadcast')
  const [peer, setPeer] = useState('')
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
  const [locationBadge, setLocationBadge] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const roomName = hostState?.roomName || 'camera-room'
  const statusLabel = useMemo(() => {
    if (!isHosting) return 'Not connected'
    if (connectionState === ConnectionState.Connected) return 'Live connection'
    if (connectionState === ConnectionState.Connecting) return 'Connecting...'
    return 'Preparing room'
  }, [connectionState, isHosting])

  const badgeCategory = hostState?.category || category
  const badgeLocation = hostState?.locationBadge || locationBadge

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const queryMode = params.get('mode') === 'direct' ? 'direct' : 'public'
    const queryIntent = params.get('intent') === 'join' ? 'join' : 'broadcast'
    const queryPeer = (params.get('peer') || params.get('host') || '').trim()

    setMode(queryMode)
    setIntent(queryIntent)
    if (queryPeer) setPeer(queryPeer)
  }, [])

  function upsertRemoteParticipant(identity: string, name: string) {
    setRemoteParticipants((prev) => {
      const existing = prev.filter((item) => item.identity !== identity)
      return [...existing, { identity, name }]
    })
  }

  async function loadHostState(nextIntent: CamIntent = intent) {
    setError('')

    const query = new URLSearchParams({
      mode,
      intent: nextIntent,
      category,
      location: locationBadge,
    })

    if (peer.trim()) {
      query.set('peer', peer.trim())
      query.set('host', peer.trim())
    }

    const response = await fetch(`/api/camera/token?${query.toString()}`, {
      method: 'GET',
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Unable to initialize camera room')
    }

    setHostState(data)
    return data as HostState
  }

  async function publishTracks(room: Room, nextIntent: CamIntent) {
    if (nextIntent === 'join' && mode === 'public') return

    const videoTrack = await createLocalVideoTrack({ facingMode: 'user' })
    localVideoTrackRef.current = videoTrack
    await room.localParticipant.publishTrack(videoTrack)

    if (isMicEnabled) {
      const audioTrack = await createLocalAudioTrack()
      localAudioTrackRef.current = audioTrack
      await room.localParticipant.publishTrack(audioTrack)
    }

    if (videoRef.current) {
      await videoTrack.attach(videoRef.current)
      await videoRef.current.play().catch(() => undefined)
    }
  }

  function handleIncomingData(payload: Uint8Array, participantIdentity?: string) {
    try {
      const raw = new TextDecoder().decode(payload)
      const parsed = JSON.parse(raw) as ChatMessage
      if (!parsed?.text) return

      setMessages((prev) => {
        const duplicate = prev.some((msg) => msg.id === parsed.id)
        if (duplicate) return prev
        return [...prev, parsed]
      })

      if (participantIdentity) {
        upsertRemoteParticipant(participantIdentity, parsed.sender || participantIdentity)
      }
    } catch {
      // Ignore malformed payloads to keep chat resilient.
    }
  }

  async function connectBroadcast(nextIntent: CamIntent = intent) {
    try {
      const state = await loadHostState(nextIntent)
      setIntent(nextIntent)
      setIsHosting(true)
      setConnectionState(ConnectionState.Connecting)

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      })

      room.on(RoomEvent.Connected, () => {
        setConnectionState(ConnectionState.Connected)
        setParticipantCount(room.numParticipants)
        setViewerNote(
          mode === 'direct'
            ? 'Direct room ready. Share the invite with your selected member.'
            : nextIntent === 'join'
            ? 'You joined a public broadcast room.'
            : 'Public broadcast is live. Others can join from your invite link.'
        )
      })

      room.on(RoomEvent.Disconnected, () => {
        setConnectionState(ConnectionState.Disconnected)
        setParticipantCount(0)
        setViewerNote('Room ended.')
      })

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        setParticipantCount(room.numParticipants)
        upsertRemoteParticipant(participant.identity, participant.name || participant.identity)
      })

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        setParticipantCount(room.numParticipants)
        setRemoteParticipants((prev) => prev.filter((p) => p.identity !== participant.identity))
      })

      room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
        if (track.kind === Track.Kind.Video) {
          const video = document.createElement('video')
          video.autoplay = true
          video.playsInline = true
          video.muted = true
          track.attach(video)
          upsertRemoteParticipant(participant.identity, participant.name || participant.identity)
          document.getElementById('viewer-grid')?.appendChild(video)
        }

        if (track.kind === Track.Kind.Audio) {
          const audio = document.createElement('audio')
          audio.autoplay = true
          track.attach(audio)
          document.body.appendChild(audio)
        }
      })

      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach().forEach((element) => element.remove())
      })

      room.on(RoomEvent.DataReceived, (payload, participant) => {
        handleIncomingData(payload, participant?.identity)
      })

      roomRef.current = room
      await room.connect(state.livekitUrl, state.token)
      await publishTracks(room, nextIntent)
      setParticipantCount(room.numParticipants)
    } catch (err) {
      console.error('Camera connection failed', err)
      setError(err instanceof Error ? err.message : 'Could not start room')
      setIsHosting(false)
      setConnectionState(ConnectionState.Disconnected)
    }
  }

  async function stopBroadcast() {
    const room = roomRef.current

    try {
      localAudioTrackRef.current?.stop()
      localVideoTrackRef.current?.stop()
      localAudioTrackRef.current = null
      localVideoTrackRef.current = null
      await room?.disconnect()
    } finally {
      roomRef.current = null
      setIsHosting(false)
      setConnectionState(ConnectionState.Disconnected)
      setParticipantCount(0)
    }
  }

  async function toggleMic() {
    const room = roomRef.current
    const nextEnabled = !isMicEnabled
    setIsMicEnabled(nextEnabled)

    if (!room) return

    if (!nextEnabled) {
      localAudioTrackRef.current?.stop()
      localAudioTrackRef.current = null
      return
    }

    const audioTrack = await createLocalAudioTrack()
    localAudioTrackRef.current = audioTrack
    await room.localParticipant.publishTrack(audioTrack)
  }

  async function toggleVideo() {
    const room = roomRef.current
    const nextEnabled = !isVideoEnabled
    setIsVideoEnabled(nextEnabled)

    if (!room) return

    if (!nextEnabled) {
      localVideoTrackRef.current?.stop()
      localVideoTrackRef.current = null
      return
    }

    const videoTrack = await createLocalVideoTrack({ facingMode: 'user' })
    localVideoTrackRef.current = videoTrack
    await room.localParticipant.publishTrack(videoTrack)
    if (videoRef.current) {
      await videoTrack.attach(videoRef.current)
    }
  }

  async function sendMessage() {
    const room = roomRef.current
    if (!room || !chatInput.trim()) return

    const payload: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sender: hostState?.participantName || 'Member',
      text: chatInput.trim(),
      timestamp: new Date().toISOString(),
    }

    const encoded = new TextEncoder().encode(JSON.stringify(payload))
    await room.localParticipant.publishData(encoded, { reliable: true })
    setMessages((prev) => [...prev, payload])
    setChatInput('')
  }

  useEffect(() => {
    return () => {
      void stopBroadcast()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-black/35 p-4 backdrop-blur-xl sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-stone-400">Profile Cam</p>
            <h2 className="mt-1 text-xl font-semibold">Private 1-on-1 or Public Broadcast</h2>
            <p className="mt-1 text-sm text-stone-400">
              Choose mode, set your category and location badge, then go live.
            </p>
          </div>
          <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-stone-200">
            {statusLabel}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-xs text-stone-300">
            Mode
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value === 'direct' ? 'direct' : 'public')}
              className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-stone-100"
            >
              <option value="public">Public Broadcast</option>
              <option value="direct">1-on-1 Direct</option>
            </select>
          </label>

          <label className="space-y-1 text-xs text-stone-300">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-stone-100"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs text-stone-300">
            Location Badge
            <input
              value={locationBadge}
              onChange={(e) => setLocationBadge(e.target.value.slice(0, 40))}
              placeholder="Berlin, DE"
              className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-stone-100 placeholder-stone-500"
            />
          </label>

          <label className="space-y-1 text-xs text-stone-300">
            Handle
            <input
              value={peer}
              onChange={(e) => setPeer(e.target.value)}
              placeholder={mode === 'direct' ? 'invitee account name' : 'host account name'}
              className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-stone-100 placeholder-stone-500"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => void connectBroadcast('broadcast')}>Start Broadcast</Button>
          <Button variant="secondary" onClick={() => void connectBroadcast('join')}>Join Stream</Button>
          <Button variant="destructive" onClick={() => void stopBroadcast()}>End / Leave</Button>
          <Button variant="outline" onClick={() => void toggleMic()}>
            {isMicEnabled ? 'Mute Mic' : 'Unmute Mic'}
          </Button>
          <Button variant="outline" onClick={() => void toggleVideo()}>
            {isVideoEnabled ? 'Disable Cam' : 'Enable Cam'}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-stone-200">
            {mode === 'direct' ? 'Direct Room' : 'Public Room'}
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-stone-200">
            Category: {badgeCategory}
          </span>
          {badgeLocation && (
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-stone-200">
              Location: {badgeLocation}
            </span>
          )}
        </div>

        {hostState?.inviteUrl && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-stone-300">
            <p className="font-semibold text-stone-100">Invite Link</p>
            <p className="mt-1 break-all">{hostState.inviteUrl}</p>
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted autoPlay />
          {connectionState !== 'connected' && (
            <div className="flex aspect-video items-center justify-center bg-black/70 text-sm text-stone-300">
              Camera preview appears here once you connect.
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">Room Details</p>
          <div className="mt-3 space-y-2 text-sm text-stone-300">
            <p>Room: {roomName}</p>
            <p>Participants: {participantCount}</p>
            <p>Account: {hostState?.accountName || 'loading...'}</p>
            <p className="text-xs text-stone-400">Identity: {hostState?.participantName || 'waiting for token'}</p>
          </div>
          {viewerNote && <p className="mt-3 text-xs text-emerald-300">{viewerNote}</p>}
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">Live Chat</p>
          <div className="mt-3 h-40 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-black/25 p-3 text-sm">
            {messages.length === 0 ? (
              <p className="text-stone-500">No messages yet. Start the room and send a message.</p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1">
                  <p className="text-xs font-semibold text-stone-200">{message.sender}</p>
                  <p className="text-sm text-stone-300">{message.text}</p>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void sendMessage()
                }
              }}
              placeholder="Type live chat message"
              className="flex-1 rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-stone-100 placeholder-stone-500"
            />
            <Button onClick={() => void sendMessage()}>Send</Button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">Participants</p>
        <div id="viewer-grid" className="mt-4 space-y-2 text-sm text-stone-300">
          {remoteParticipants.length === 0 ? (
            <p>No remote participants yet.</p>
          ) : (
            remoteParticipants.map((participant) => (
              <div key={participant.identity} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                {participant.name}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
