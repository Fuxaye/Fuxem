'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Bookmark,
  Camera,
  CirclePlay,
  Compass,
  Heart,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  MessageCircle,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Settings,
  Share2,
  Sparkles,
  Star,
  UserCircle2,
  Users,
  Video,
} from 'lucide-react'

type ViewKey = 'home' | 'discover' | 'videos' | 'photos' | 'forums' | 'chat' | 'friends' | 'profile' | 'uploads' | 'dashboard'

type FeedPost = {
  id: string
  name: string
  handle: string
  verified: boolean
  time: string
  text: string
  image?: string
  imageAlt?: string
  likes: number
  comments: number
  reposts: number
  bookmarks: number
  shares: number
}

type Creator = {
  id: string
  name: string
  handle: string
  avatar: string
  following: boolean
}

type Room = {
  id: string
  name: string
  preview: string
  timestamp: string
  unread: number
  members: number
  messages: Array<{
    id: string
    fromSelf?: boolean
    sender: string
    body: string
    time: string
  }>
}

type Thread = {
  id: string
  title: string
  category: string
  replies: number
  views: string
  lastReply: string
  pinned?: boolean
}

type FriendCard = {
  id: string
  name: string
  handle: string
  online: boolean
  mutual: number
}

const views: Array<{ key: ViewKey; label: string; icon: typeof Home }> = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'discover', label: 'Discover', icon: Compass },
  { key: 'videos', label: 'Videos', icon: Video },
  { key: 'photos', label: 'Photos', icon: ImageIcon },
  { key: 'forums', label: 'Forums', icon: MessageSquare },
  { key: 'chat', label: 'Chat', icon: MessageCircle },
  { key: 'friends', label: 'Friends', icon: Users },
  { key: 'profile', label: 'Profile', icon: UserCircle2 },
  { key: 'uploads', label: 'Uploads', icon: Camera },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

const storyAvatars = [
  { name: 'You', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', hasStory: false },
  { name: 'Mila Fox', avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80', hasStory: true },
  { name: 'Jade Noir', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', hasStory: true },
  { name: 'Sloane Vale', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80', hasStory: true },
  { name: 'Nina West', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80', hasStory: true },
  { name: 'Lex Arden', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', hasStory: true },
]

const feedPosts: FeedPost[] = [
  {
    id: 'post-1',
    name: 'Mila Fox',
    handle: '@milafx',
    verified: true,
    time: '12m',
    text: 'Soft lighting, good music, and a clean frame make the evening feel expensive. New set drops at 8.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Portrait model in dramatic studio lighting',
    likes: 1240,
    comments: 89,
    reposts: 17,
    bookmarks: 61,
    shares: 24,
  },
  {
    id: 'post-2',
    name: 'Jade Noir',
    handle: '@jadenoir',
    verified: true,
    time: '1h',
    text: 'Just posted a behind-the-scenes clip from tonight’s neon rooftop shoot. The city looked unreal after midnight.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Creator portrait with a neon city feel',
    likes: 980,
    comments: 52,
    reposts: 23,
    bookmarks: 44,
    shares: 18,
  },
  {
    id: 'post-3',
    name: 'Sloane Vale',
    handle: '@sloanevale',
    verified: true,
    time: '3h',
    text: 'New gallery is up. Same energy, cleaner crop, more shadow detail. Curious what everyone thinks of the tighter framing.',
    likes: 702,
    comments: 31,
    reposts: 12,
    bookmarks: 28,
    shares: 11,
  },
]

const creators: Creator[] = [
  { id: 'creator-1', name: 'Ari Winters', handle: '@ariw', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80', following: false },
  { id: 'creator-2', name: 'Nova Reed', handle: '@novareed', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', following: true },
  { id: 'creator-3', name: 'Cleo Hart', handle: '@cleohart', avatar: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=300&q=80', following: false },
]

const photoGrid = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=80',
]

const featuredVideos = [
  {
    title: 'After Midnight',
    creator: 'Mila Fox',
    views: '84.2K',
    duration: '08:24',
    thumb: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'City Heat',
    creator: 'Jade Noir',
    views: '61.8K',
    duration: '05:12',
    thumb: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Studio Notes',
    creator: 'Sloane Vale',
    views: '38.3K',
    duration: '03:47',
    thumb: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
  },
]

const rooms: Room[] = [
  {
    id: 'room-1',
    name: 'Late Night Crew',
    preview: 'Sloane: dropping a new teaser in 10',
    timestamp: '2m',
    unread: 4,
    members: 18,
    messages: [
      { id: 'm1', sender: 'Sloane', body: 'Dropping a new teaser in 10.', time: '9:12 PM' },
      { id: 'm2', fromSelf: true, sender: 'You', body: 'Perfect, I’m clipping the intro now.', time: '9:13 PM' },
      { id: 'm3', sender: 'Jade', body: 'Make sure the sound stays low and warm.', time: '9:14 PM' },
    ],
  },
  {
    id: 'room-2',
    name: 'Photo Tips',
    preview: 'Ari: lens flare on the left looks incredible',
    timestamp: '18m',
    unread: 1,
    members: 42,
    messages: [
      { id: 'm4', sender: 'Ari', body: 'Lens flare on the left looks incredible.', time: '8:56 PM' },
      { id: 'm5', fromSelf: true, sender: 'You', body: 'That crop is better. Much cleaner composition.', time: '8:58 PM' },
    ],
  },
]

const forumThreads: Thread[] = [
  { id: 'thread-1', title: 'Best lighting setup for indoor shoots?', category: 'Creator Tips', replies: 34, views: '1.2K', lastReply: '7m ago', pinned: true },
  { id: 'thread-2', title: 'What’s your favorite way to organize content drops?', category: 'General', replies: 18, views: '842', lastReply: '26m ago' },
  { id: 'thread-3', title: 'Looking for trusted editors in LA', category: 'Creator Tips', replies: 12, views: '640', lastReply: '1h ago' },
  { id: 'thread-4', title: 'Platform roadmap and feedback thread', category: 'Announcements', replies: 9, views: '512', lastReply: '3h ago', pinned: true },
]

const friendCards: FriendCard[] = [
  { id: 'friend-1', name: 'Elena Cross', handle: '@elenacross', online: true, mutual: 12 },
  { id: 'friend-2', name: 'Rory Hale', handle: '@roryhale', online: false, mutual: 8 },
  { id: 'friend-3', name: 'Vera Saint', handle: '@verasaint', online: true, mutual: 16 },
  { id: 'friend-4', name: 'Mason Luxe', handle: '@masonluxe', online: true, mutual: 5 },
  { id: 'friend-5', name: 'Iris Bloom', handle: '@irisbloom', online: false, mutual: 11 },
  { id: 'friend-6', name: 'Theo Vice', handle: '@theovice', online: true, mutual: 9 },
]

const uploadSamples = [
  { title: 'Portrait set', type: 'photo', status: 'Ready for upload' },
  { title: 'Behind the scenes reel', type: 'video', status: 'Waiting on trim' },
  { title: 'Cover image', type: 'photo', status: 'Synced to CDN' },
]

function formatNumber(value: number): string {
  return Intl.NumberFormat('en-US').format(value)
}

function getViewFromHash(): ViewKey {
  const hash = window.location.hash.replace('#', '') as ViewKey
  return views.some((view) => view.key === hash) ? hash : 'home'
}

function Avatar({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} className={`rounded-full object-cover ${className}`} loading="lazy" />
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(124,92,252,0.12)] bg-[#13111E] px-4 py-3">
      <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6B6585]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[#EDE9FF]">{value}</div>
    </div>
  )
}

function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#6B6585]">fuxem creator platform</p>
        <h1 className="mt-2 text-3xl font-bold text-[#EDE9FF] md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B6585]">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}

export default function CreatorPlatformShell() {
  const [activeView, setActiveView] = useState<ViewKey>('home')
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({})
  const [followingCreators, setFollowingCreators] = useState<Record<string, boolean>>({})
  const [profileTab, setProfileTab] = useState<'Posts' | 'Photos' | 'Videos' | 'About'>('Posts')
  const [friendTab, setFriendTab] = useState<'Friends' | 'Requests' | 'Suggestions'>('Friends')
  const [activeRoomId, setActiveRoomId] = useState(rooms[0]?.id || '')
  const [chatDraft, setChatDraft] = useState('')
  const [postDraft, setPostDraft] = useState('Share a new post, a fresh clip, or a behind-the-scenes note...')
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadBusy, setUploadBusy] = useState(false)
  const [uploadResults, setUploadResults] = useState<Array<{ kind: string; url: string }>>([])
  const [dashboardData, setDashboardData] = useState<{ profileViews: number; connections: number; messagesReceived: number; engagementPercent: number; totalVideos: number; publicVideos: number; unreadMessages: number; pendingReports: number } | null>(null)

  const activeRoom = useMemo(() => rooms.find((room) => room.id === activeRoomId) || rooms[0], [activeRoomId])

  useEffect(() => {
    const syncView = () => setActiveView(getViewFromHash())

    syncView()
    window.addEventListener('hashchange', syncView)

    return () => window.removeEventListener('hashchange', syncView)
  }, [])

  useEffect(() => {
    if (activeView !== 'dashboard') {
      return
    }

    let cancelled = false

    async function loadDashboard() {
      try {
        const response = await fetch('/api/dashboard/live', { cache: 'no-store' })
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as {
          stats?: { profileViews: number; connections: number; messagesReceived: number; engagementPercent: number }
          modelStats?: { totalVideos: number; publicVideos: number; unreadMessages: number; pendingReports: number }
        }

        if (!cancelled && payload.stats && payload.modelStats) {
          setDashboardData({ ...payload.stats, ...payload.modelStats })
        }
      } catch {
        if (!cancelled) {
          setDashboardData(null)
        }
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [activeView])

  function goTo(view: ViewKey) {
    window.location.hash = view
    setActiveView(view)
  }

  function togglePostLike(postId: string) {
    setLikedPosts((current) => ({ ...current, [postId]: !current[postId] }))
  }

  function toggleBookmark(postId: string) {
    setBookmarkedPosts((current) => ({ ...current, [postId]: !current[postId] }))
  }

  function toggleFollow(creatorId: string) {
    setFollowingCreators((current) => ({ ...current, [creatorId]: !current[creatorId] }))
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const file = formData.get('file')
    const kind = formData.get('kind')

    if (!(file instanceof File)) {
      setUploadMessage('Select a file to upload.')
      return
    }

    if (typeof kind !== 'string') {
      setUploadMessage('Pick upload type first.')
      return
    }

    setUploadBusy(true)
    setUploadMessage('Uploading to Bunny CDN...')

    try {
      const payload = new FormData()
      payload.append('kind', kind)
      payload.append('file', file)

      const response = await fetch('/api/member/media/upload', {
        method: 'POST',
        body: payload,
      })

      const result = (await response.json().catch(() => null)) as { error?: string; url?: string; kind?: string } | null

      if (!response.ok || !result?.url || !result.kind) {
        throw new Error(result?.error || 'Upload failed.')
      }

      setUploadResults((current) => [{ kind: result.kind || kind, url: result.url as string }, ...current].slice(0, 6))
      setUploadMessage('Upload complete and saved to CDN.')
      event.currentTarget.reset()
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Upload failed.')
    } finally {
      setUploadBusy(false)
    }
  }

  function sendChat() {
    if (!chatDraft.trim()) {
      return
    }

    setChatDraft('')
  }

  const sidebar = (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-20 flex-col border-r border-[rgba(124,92,252,0.12)] bg-[#0D0C14]/95 px-3 py-4 backdrop-blur-xl lg:w-72 lg:px-5">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7C5CFC,#9B7BFF)] text-lg font-bold text-white shadow-lg shadow-violet-500/20">
          f
        </div>
        <div className="hidden lg:block">
          <div className="font-heading text-lg font-bold tracking-[0.08em] text-[#EDE9FF]">fuxem</div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6585]">creator social</div>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2 overflow-y-auto ui-scrollbar-hide">
        {views.map((view) => {
          const Icon = view.icon
          const active = activeView === view.key

          return (
            <button
              key={view.key}
              type="button"
              onClick={() => goTo(view.key)}
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active ? 'bg-[rgba(124,92,252,0.16)] text-[#7C5CFC]' : 'text-[#C4BDEE] hover:bg-white/5 hover:text-[#EDE9FF]'}`}
            >
              <Icon size={18} strokeWidth={active ? 2.25 : 2} />
              <span className="hidden text-sm font-semibold lg:block">{view.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-4 rounded-[1.15rem] border border-[rgba(124,92,252,0.12)] bg-[#13111E] p-3 lg:p-4">
        <div className="flex items-center gap-3">
          <Avatar
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
            alt="Current user avatar"
            className="h-11 w-11 border border-[rgba(124,92,252,0.18)]"
          />
          <div className="hidden lg:block">
            <div className="text-sm font-semibold text-[#EDE9FF]">Avery Vale</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6B6585]">@averyvale</div>
          </div>
          <button type="button" className="ml-auto rounded-full border border-[rgba(124,92,252,0.18)] bg-[#1E1C2E] p-2 text-[#C4BDEE] transition hover:border-[rgba(124,92,252,0.35)] hover:text-[#EDE9FF]">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#0D0C14] text-[#EDE9FF]">
      {sidebar}

      <main className="min-h-screen pl-20 lg:pl-72">
        <div className="mx-auto flex min-h-screen max-w-[1750px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <section className="min-w-0 flex-1 space-y-6">
            <div className="ui-shell-panel px-5 py-5 sm:px-6">
              <PageHeader
                title={
                  activeView === 'home'
                    ? 'Home Feed'
                    : activeView === 'discover'
                      ? 'Discover'
                      : activeView === 'videos'
                        ? 'Videos'
                        : activeView === 'photos'
                          ? 'Photos'
                          : activeView === 'forums'
                            ? 'Forums'
                            : activeView === 'chat'
                              ? 'Chat Rooms'
                              : activeView === 'friends'
                                ? 'Friends'
                                : activeView === 'profile'
                                  ? 'Profile'
                                  : activeView === 'uploads'
                                    ? 'Uploads'
                                    : 'Dashboard'
                }
                description="A dark creator social experience with client-side routing, live actions, and shared surfaces that stay visually consistent across every page."
                action={<button type="button" className="ui-button-primary px-5 py-3 text-sm font-semibold">Create Post</button>}
              />
            </div>

            {activeView === 'home' ? (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                  <section className="ui-shell-panel p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-lg font-semibold text-[#EDE9FF]">Stories</h2>
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6585]">Live now</span>
                    </div>
                    <div className="mt-4 flex gap-4 overflow-x-auto pb-1 ui-scrollbar-hide">
                      {storyAvatars.map((story, index) => (
                        <button key={story.name} type="button" className="flex w-20 shrink-0 flex-col items-center gap-2 text-center">
                          <div className={`rounded-full p-[3px] ${story.hasStory ? 'bg-[linear-gradient(135deg,#FF6B6B,#7C5CFC,#3DCFCF)]' : 'bg-[#1E1C2E]'}`}>
                            <div className="rounded-full bg-[#0D0C14] p-[2px]">
                              <Avatar src={story.avatar} alt={`${story.name} story`} className="h-14 w-14" />
                            </div>
                          </div>
                          <span className="w-full text-xs text-[#C4BDEE]">{index === 0 ? 'Your Story' : story.name}</span>
                        </button>
                      ))}
                      <button type="button" className="flex w-20 shrink-0 flex-col items-center gap-2 text-center">
                        <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full border border-dashed border-[rgba(124,92,252,0.2)] bg-[#1E1C2E] text-[#7C5CFC]">
                          <Sparkles size={18} />
                        </div>
                        <span className="text-xs text-[#C4BDEE]">Add</span>
                      </button>
                    </div>
                  </section>

                  <section className="ui-shell-panel p-5">
                    <div className="flex gap-3">
                      <Avatar src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80" alt="Current user avatar" className="h-12 w-12 border border-[rgba(124,92,252,0.18)]" />
                      <div className="flex-1">
                        <textarea
                          value={postDraft}
                          onChange={(event) => setPostDraft(event.target.value)}
                          className="ui-input min-h-28 w-full resize-none px-4 py-3 text-sm leading-6"
                        />
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-[#6B6585]">
                            <button type="button" className="ui-button-secondary px-3 py-2 text-xs">Add Media</button>
                            <button type="button" className="ui-button-secondary px-3 py-2 text-xs">Poll</button>
                          </div>
                          <button type="button" className="ui-button-primary px-5 py-3 text-sm font-semibold">Post</button>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="space-y-5">
                    {feedPosts.map((post) => {
                      const liked = Boolean(likedPosts[post.id])
                      const bookmarked = Boolean(bookmarkedPosts[post.id])

                      return (
                        <article key={post.id} className="ui-shell-panel overflow-hidden">
                          <div className="p-5">
                            <div className="flex items-center gap-3">
                              <Avatar src={`https://images.unsplash.com/${post.id === 'post-1' ? 'photo-1488426862026-3ee34a7d66df' : post.id === 'post-2' ? 'photo-1534528741775-53994a69daeb' : 'photo-1515886657613-9f3515b0c78f'}?auto=format&fit=crop&w=200&q=80`} alt={`${post.name} avatar`} className="h-12 w-12" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-semibold text-[#EDE9FF]">{post.name}</h3>
                                  {post.verified ? <Star size={14} className="text-[#7C5CFC]" fill="currentColor" /> : null}
                                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#6B6585]">{post.time}</span>
                                </div>
                                <p className="text-xs text-[#6B6585]">{post.handle}</p>
                              </div>
                              <button type="button" className="rounded-full border border-[rgba(124,92,252,0.12)] bg-[#1E1C2E] p-2 text-[#C4BDEE]">
                                <MoreHorizontal size={16} />
                              </button>
                            </div>

                            <p className="mt-4 text-sm leading-6 text-[#EDE9FF]">{post.text}</p>

                            {post.image ? (
                              <img src={post.image} alt={post.imageAlt || `${post.name} post`} className="mt-4 aspect-[4/3] w-full rounded-[1rem] object-cover" loading="lazy" />
                            ) : null}

                            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.12em] text-[#6B6585]">
                              <span>{formatNumber(post.comments)} comments</span>
                              <span>{formatNumber(post.reposts)} reposts</span>
                              <span>{formatNumber(post.bookmarks)} bookmarks</span>
                              <span>{formatNumber(post.shares)} shares</span>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-2 border-t border-[rgba(124,92,252,0.12)] pt-4 text-sm">
                              <button type="button" onClick={() => togglePostLike(post.id)} className={`flex items-center gap-2 rounded-full px-3 py-2 transition ${liked ? 'bg-[rgba(255,107,107,0.12)] text-[#FF6B6B]' : 'bg-[#1E1C2E] text-[#C4BDEE]'}`}>
                                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                                <span>{formatNumber(post.likes + (liked ? 1 : 0))}</span>
                              </button>
                              <button type="button" className="flex items-center gap-2 rounded-full bg-[#1E1C2E] px-3 py-2 text-[#C4BDEE]">
                                <MessageCircle size={16} />
                                <span>{formatNumber(post.comments)}</span>
                              </button>
                              <button type="button" className="flex items-center gap-2 rounded-full bg-[#1E1C2E] px-3 py-2 text-[#C4BDEE]">
                                <Share2 size={16} />
                                <span>{formatNumber(post.shares)}</span>
                              </button>
                              <button type="button" onClick={() => toggleBookmark(post.id)} className={`flex items-center gap-2 rounded-full px-3 py-2 transition ${bookmarked ? 'bg-[rgba(124,92,252,0.12)] text-[#7C5CFC]' : 'bg-[#1E1C2E] text-[#C4BDEE]'}`}>
                                <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
                                <span>{formatNumber(post.bookmarks + (bookmarked ? 1 : 0))}</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>

                <aside className="space-y-6">
                  <section className="ui-shell-panel p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-[#EDE9FF]">Trending</h2>
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6B6585]">24h</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {['#studioafterdark', '#modeltips', '#late-night-lighting', '#creatordrops', '#cdnworkflow'].map((topic, index) => (
                        <div key={topic} className="flex items-center justify-between rounded-2xl bg-[#1E1C2E] px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold text-[#EDE9FF]">{topic}</div>
                            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6B6585]">{formatNumber(48 + index * 17)} posts</div>
                          </div>
                          <Compass size={16} className="text-[#7C5CFC]" />
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="ui-shell-panel p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-[#EDE9FF]">Suggested Creators</h2>
                      <Sparkles size={16} className="text-[#7C5CFC]" />
                    </div>
                    <div className="mt-4 space-y-4">
                      {creators.map((creator) => {
                        const following = Boolean(followingCreators[creator.id] ?? creator.following)

                        return (
                          <div key={creator.id} className="flex items-center gap-3 rounded-2xl bg-[#1E1C2E] px-3 py-3">
                            <Avatar src={creator.avatar} alt={`${creator.name} avatar`} className="h-11 w-11" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-[#EDE9FF]">{creator.name}</div>
                              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6B6585]">{creator.handle}</div>
                            </div>
                            <button type="button" onClick={() => toggleFollow(creator.id)} className={following ? 'ui-button-secondary px-4 py-2 text-xs' : 'ui-button-primary px-4 py-2 text-xs'}>
                              {following ? 'Following' : 'Follow'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                </aside>
              </div>
            ) : null}

            {activeView === 'discover' ? (
              <section className="ui-shell-panel p-5">
                <PageHeader title="Discover creators, rooms, and momentum" description="Use this surface to surface high-signal profiles and filters while keeping the same dark visual language." />
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {creators.map((creator) => (
                    <article key={creator.id} className="ui-card p-4">
                      <Avatar src={creator.avatar} alt={`${creator.name} profile`} className="h-20 w-20" />
                      <h3 className="mt-4 text-lg font-semibold text-[#EDE9FF]">{creator.name}</h3>
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#6B6585]">{creator.handle}</p>
                      <p className="mt-3 text-sm text-[#C4BDEE]">Curating bold visuals, new uploads, and a consistent creator presence.</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeView === 'videos' ? (
              <section className="space-y-6">
                <article className="ui-shell-panel overflow-hidden p-5">
                  <PageHeader title="Videos" description="A featured hero, trending row, and recent uploads keep the focus on visual playback." action={<button className="ui-button-primary px-5 py-3 text-sm font-semibold" type="button">Upload Video</button>} />
                  <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                    <div className="group relative overflow-hidden rounded-[1rem] border border-[rgba(124,92,252,0.12)] bg-[#13111E]">
                      <img src={featuredVideos[0].thumb} alt={`${featuredVideos[0].title} featured video`} className="h-[360px] w-full object-cover transition duration-200 group-hover:scale-[1.03]" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0C14] via-[#0D0C14]/20 to-transparent" />
                      <button type="button" className="absolute inset-0 m-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/12 text-white backdrop-blur">
                        <CirclePlay size={32} fill="currentColor" />
                      </button>
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-semibold text-[#EDE9FF]">{featuredVideos[0].title}</h3>
                          <p className="mt-1 text-sm text-[#C4BDEE]">{featuredVideos[0].creator} · {featuredVideos[0].views} views</p>
                        </div>
                        <div className="rounded-full bg-black/50 px-3 py-1 font-mono text-xs text-[#EDE9FF]">{featuredVideos[0].duration}</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {featuredVideos.slice(1).map((video) => (
                        <article key={video.title} className="ui-card overflow-hidden p-3">
                          <div className="relative overflow-hidden rounded-[0.9rem]">
                            <img src={video.thumb} alt={`${video.title} thumbnail`} className="h-40 w-full object-cover transition duration-200 hover:scale-[1.03]" loading="lazy" />
                            <div className="absolute inset-0 bg-black/0 opacity-0 transition hover:bg-black/15 hover:opacity-100" />
                            <div className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2 py-1 font-mono text-[11px] text-white">{video.duration}</div>
                          </div>
                          <div className="mt-3 flex items-center gap-3 px-1 pb-1">
                            <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt={`${video.creator} avatar`} className="h-10 w-10" />
                            <div>
                              <h4 className="text-sm font-semibold text-[#EDE9FF]">{video.title}</h4>
                              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6B6585]">{video.creator} · {video.views} views</p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </article>
              </section>
            ) : null}

            {activeView === 'photos' ? (
              <section className="ui-shell-panel p-5">
                <PageHeader title="Photos" description="Curated portrait and lifestyle photography with filters, masonry rhythm, and quick-save actions." action={<div className="flex flex-wrap gap-2">{['All', 'Following', 'Trending', 'New'].map((pill, index) => <button key={pill} type="button" className={index === 0 ? 'ui-button-primary px-4 py-2 text-sm font-semibold' : 'ui-button-secondary px-4 py-2 text-sm'}>{pill}</button>)}</div>} />
                <div className="mt-6 columns-1 gap-4 space-y-4 md:columns-2 xl:columns-3">
                  {photoGrid.map((photo, index) => (
                    <article key={photo} className="group relative mb-4 overflow-hidden rounded-[1rem] border border-[rgba(124,92,252,0.12)] bg-[#13111E]">
                      <img src={photo} alt={`Portrait photography ${index + 1}`} className="h-auto w-full object-cover transition duration-200 group-hover:scale-[1.03]" loading="lazy" />
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#0D0C14]/90 via-[#0D0C14]/15 to-transparent opacity-0 transition group-hover:opacity-100">
                        <div className="flex w-full items-center justify-between px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80" alt="Photographer avatar" className="h-10 w-10 border border-white/10" />
                            <div>
                              <div className="text-sm font-semibold text-white">Sloane Vale</div>
                              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/70">{formatNumber(400 + index * 52)} likes</div>
                            </div>
                          </div>
                          <button type="button" className="rounded-full bg-white/10 p-2 text-white backdrop-blur">
                            <Bookmark size={16} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <button type="button" className="ui-button-secondary px-6 py-3 text-sm font-semibold">Load More</button>
                </div>
              </section>
            ) : null}

            {activeView === 'forums' ? (
              <section className="space-y-6">
                <div className="ui-shell-panel p-5">
                  <PageHeader title="Forums" description="Threaded conversations, category cards, and pinned topics keep deeper community discussion organized." action={<button type="button" className="ui-button-primary px-5 py-3 text-sm font-semibold">New Thread</button>} />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {['General', 'Creator Tips', 'Off-Topic', 'Announcements'].map((category, index) => (
                    <article key={category} className="ui-card p-4">
                      <div className="text-sm font-semibold text-[#EDE9FF]">{category}</div>
                      <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#6B6585]">{formatNumber(24 + index * 18)} posts</div>
                    </article>
                  ))}
                </div>
                <div className="space-y-3">
                  {forumThreads.map((thread) => (
                    <article key={thread.id} className={`ui-shell-panel flex items-center justify-between gap-4 p-4 ${thread.pinned ? 'bg-[#1E1C2E]' : ''}`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {thread.pinned ? <Mic size={14} className="text-[#7C5CFC]" /> : null}
                          <h3 className="truncate text-sm font-semibold text-[#EDE9FF]">{thread.title}</h3>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-[#6B6585]">
                          <span className="rounded-full bg-[#1E1C2E] px-2 py-1 text-[#C4BDEE]">{thread.category}</span>
                          <span className="font-mono uppercase tracking-[0.12em]">{thread.replies} replies</span>
                          <span className="font-mono uppercase tracking-[0.12em]">{thread.views} views</span>
                          <span className="font-mono uppercase tracking-[0.12em]">{thread.lastReply}</span>
                        </div>
                      </div>
                      <button type="button" className="ui-button-secondary px-4 py-2 text-xs">Open</button>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeView === 'chat' ? (
              <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="ui-shell-panel p-4">
                  <input className="ui-input w-full px-4 py-3 text-sm" placeholder="Search rooms" />
                  <div className="mt-4 space-y-3">
                    {rooms.map((room) => {
                      const active = room.id === activeRoomId
                      return (
                        <button key={room.id} type="button" onClick={() => setActiveRoomId(room.id)} className={`w-full rounded-2xl px-3 py-3 text-left transition ${active ? 'bg-[rgba(124,92,252,0.16)]' : 'bg-[#1E1C2E]'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-[#EDE9FF]">{room.name}</div>
                              <div className="mt-1 text-xs text-[#6B6585]">{room.preview}</div>
                            </div>
                            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6B6585]">{room.timestamp}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-[#6B6585]">
                            <span>{room.members} members</span>
                            {room.unread ? <span className="rounded-full bg-[#FF6B6B] px-2 py-0.5 text-[10px] font-semibold text-white">{room.unread}</span> : null}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </aside>
                <article className="ui-shell-panel flex min-h-[680px] flex-col p-4">
                  <header className="flex items-center justify-between border-b border-[rgba(124,92,252,0.12)] pb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-[#EDE9FF]">{activeRoom?.name}</h2>
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#6B6585]">{activeRoom?.members} members online</p>
                    </div>
                    <button type="button" className="ui-button-secondary p-2">
                      <Settings size={16} />
                    </button>
                  </header>
                  <div className="flex-1 space-y-4 overflow-y-auto py-4 ui-scrollbar-hide">
                    {activeRoom?.messages.map((message) => (
                      <div key={message.id} className={`flex ${message.fromSelf ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[72%] rounded-[1rem] px-4 py-3 ${message.fromSelf ? 'bg-[linear-gradient(135deg,#7C5CFC,#9B7BFF)] text-white' : 'bg-[#1E1C2E] text-[#EDE9FF]'}`}>
                          <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] opacity-70">
                            <span>{message.sender}</span>
                            <span>{message.time}</span>
                          </div>
                          <p className="text-sm leading-6">{message.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-end gap-3 border-t border-[rgba(124,92,252,0.12)] pt-4">
                    <button type="button" className="ui-button-secondary p-3"><Sparkles size={16} /></button>
                    <textarea value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Write a message..." className="ui-input min-h-14 flex-1 resize-none px-4 py-3 text-sm" />
                    <button type="button" onClick={sendChat} className="ui-button-primary px-5 py-3 text-sm font-semibold">Send</button>
                  </div>
                </article>
              </section>
            ) : null}

            {activeView === 'friends' ? (
              <section className="space-y-6">
                <div className="ui-shell-panel p-5">
                  <div className="flex flex-wrap gap-2">
                    {['Friends', 'Requests', 'Suggestions'].map((tab) => (
                      <button key={tab} type="button" onClick={() => setFriendTab(tab as 'Friends' | 'Requests' | 'Suggestions')} className={friendTab === tab ? 'ui-button-primary px-4 py-2 text-sm font-semibold' : 'ui-button-secondary px-4 py-2 text-sm'}>
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                {friendTab === 'Friends' ? (
                  <div>
                    <input className="ui-input mb-5 w-full px-4 py-3 text-sm" placeholder="Search friends" />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {friendCards.map((friend) => (
                        <article key={friend.id} className="ui-card p-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={`https://images.unsplash.com/${friend.id === 'friend-1' ? 'photo-1438761681033-6461ffad8d80' : friend.id === 'friend-2' ? 'photo-1500648767791-00dcc994a43e' : friend.id === 'friend-3' ? 'photo-1521119989659-a83eee488004' : friend.id === 'friend-4' ? 'photo-1534528741775-53994a69daeb' : friend.id === 'friend-5' ? 'photo-1488426862026-3ee34a7d66df' : 'photo-1494790108377-be9c29b29330'}?auto=format&fit=crop&w=200&q=80`} alt={`${friend.name} avatar`} className="h-14 w-14" />
                            <div>
                              <div className="text-sm font-semibold text-[#EDE9FF]">{friend.name}</div>
                              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6B6585]">{friend.handle}</div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-[#6B6585]">
                                <span className={`h-2.5 w-2.5 rounded-full ${friend.online ? 'bg-[#3DCFCF]' : 'bg-[#6B6585]'}`} />
                                <span>{friend.online ? 'Online' : 'Offline'}</span>
                                <span>•</span>
                                <span>{friend.mutual} mutual</span>
                              </div>
                            </div>
                          </div>
                          <button type="button" className="ui-button-primary mt-4 w-full px-4 py-3 text-sm font-semibold">Message</button>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
                {friendTab === 'Requests' ? (
                  <div className="space-y-3">
                    {friendCards.slice(0, 3).map((friend) => (
                      <article key={friend.id} className="ui-shell-panel flex items-center justify-between gap-3 p-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={`https://images.unsplash.com/${friend.id === 'friend-1' ? 'photo-1438761681033-6461ffad8d80' : friend.id === 'friend-2' ? 'photo-1500648767791-00dcc994a43e' : 'photo-1521119989659-a83eee488004'}?auto=format&fit=crop&w=200&q=80`} alt={`${friend.name} avatar`} className="h-12 w-12" />
                          <div>
                            <div className="text-sm font-semibold text-[#EDE9FF]">{friend.name}</div>
                            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6B6585]">{friend.mutual} mutual friends</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" className="ui-button-primary px-4 py-2 text-sm font-semibold">Accept</button>
                          <button type="button" className="ui-button-secondary px-4 py-2 text-sm">Decline</button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : null}
                {friendTab === 'Suggestions' ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {friendCards.slice(3).map((friend) => (
                      <article key={friend.id} className="ui-card p-4 text-center">
                        <Avatar src={`https://images.unsplash.com/${friend.id === 'friend-4' ? 'photo-1534528741775-53994a69daeb' : friend.id === 'friend-5' ? 'photo-1488426862026-3ee34a7d66df' : 'photo-1494790108377-be9c29b29330'}?auto=format&fit=crop&w=200&q=80`} alt={`${friend.name} avatar`} className="mx-auto h-16 w-16" />
                        <div className="mt-3 text-sm font-semibold text-[#EDE9FF]">{friend.name}</div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6B6585]">{friend.handle}</div>
                        <button type="button" className="ui-button-primary mt-4 px-5 py-3 text-sm font-semibold">Add Friend</button>
                      </article>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            {activeView === 'profile' ? (
              <section className="space-y-6">
                <article className="ui-shell-panel overflow-hidden">
                  <div className="relative h-80">
                    <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80" alt="Profile banner photo" className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0D0C14] to-transparent" />
                    <div className="absolute -bottom-12 left-6 rounded-full border-4 border-[#7C5CFC] bg-[#0D0C14] p-1">
                      <Avatar src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80" alt="Profile avatar" className="h-24 w-24" />
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-16">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-semibold text-[#EDE9FF]">Sloane Vale</h2>
                          <Star size={16} className="text-[#7C5CFC]" fill="currentColor" />
                          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#6B6585]">@sloanevale</span>
                        </div>
                        <p className="mt-2 text-sm text-[#C4BDEE]">Photographer and creator based in Los Angeles. Building cinematic sets, sharing edits, and keeping it polished.</p>
                        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#6B6585]">Los Angeles · Joined April 2023</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="ui-button-primary px-5 py-3 text-sm font-semibold">Follow</button>
                        <button type="button" className="ui-button-secondary px-5 py-3 text-sm">Message</button>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 text-sm">
                      {(['Posts', 'Photos', 'Videos', 'About'] as const).map((tab) => (
                        <button key={tab} type="button" onClick={() => setProfileTab(tab)} className={profileTab === tab ? 'ui-button-primary px-4 py-2 text-sm font-semibold' : 'ui-button-secondary px-4 py-2 text-sm'}>
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {photoGrid.slice(0, 6).map((photo, index) => (
                    <article key={photo} className="group relative overflow-hidden rounded-[1rem] border border-[rgba(124,92,252,0.12)] bg-[#13111E]">
                      <img src={photo} alt={`Profile gallery ${index + 1}`} className="aspect-[4/5] w-full object-cover transition duration-200 group-hover:scale-[1.03]" loading="lazy" />
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#0D0C14]/90 to-transparent opacity-0 transition group-hover:opacity-100">
                        <div className="flex w-full items-center justify-between px-4 py-4 text-sm text-white">
                          <span className="font-mono uppercase tracking-[0.12em]">{formatNumber(180 + index * 31)} views</span>
                          <Heart size={16} fill="currentColor" />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeView === 'uploads' ? (
              <section className="space-y-6">
                <div className="ui-shell-panel p-5">
                  <PageHeader title="Uploads" description="Upload photos and videos directly to Bunny CDN, then save the resulting URL back to the member media API." />
                </div>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                  <form onSubmit={handleUpload} className="ui-shell-panel space-y-4 p-5">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#6B6585]">Upload Type</label>
                      <select name="kind" className="ui-input w-full px-4 py-3 text-sm">
                        <option value="photo">Photo</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#6B6585]">File</label>
                      <input name="file" type="file" accept="image/*,video/*" className="ui-input w-full px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#7C5CFC] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
                    </div>
                    <button type="submit" disabled={uploadBusy} className="ui-button-primary w-full px-5 py-3 text-sm font-semibold disabled:opacity-50">
                      {uploadBusy ? 'Uploading...' : 'Upload to Bunny CDN'}
                    </button>
                    <p className="min-h-6 text-sm text-[#C4BDEE]">{uploadMessage || 'Uploads are available to authenticated users, with media policy checks applied by the API.'}</p>
                  </form>

                  <div className="space-y-4">
                    <div className="ui-shell-panel p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold text-[#EDE9FF]">Upload Queue</h2>
                          <p className="mt-1 text-sm text-[#6B6585]">Recent results copied from the Bunny-backed upload flow.</p>
                        </div>
                        <Camera className="text-[#7C5CFC]" />
                      </div>
                      <div className="mt-4 space-y-3">
                        {uploadSamples.map((sample) => (
                          <div key={sample.title} className="flex items-center justify-between rounded-2xl bg-[#1E1C2E] px-4 py-3 text-sm">
                            <div>
                              <div className="font-semibold text-[#EDE9FF]">{sample.title}</div>
                              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6B6585]">{sample.type}</div>
                            </div>
                            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#3DCFCF]">{sample.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {uploadResults.length ? (
                      <div className="ui-shell-panel p-5">
                        <h3 className="text-sm font-semibold text-[#EDE9FF]">Latest uploaded URLs</h3>
                        <div className="mt-3 space-y-2">
                          {uploadResults.map((item) => (
                            <a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-[rgba(124,92,252,0.12)] bg-[#1E1C2E] px-4 py-3 text-sm text-[#C4BDEE] transition hover:border-[rgba(124,92,252,0.24)] hover:text-[#EDE9FF]">
                              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6B6585]">{item.kind}</span>
                              <div className="mt-1 break-all">{item.url}</div>
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}

            {activeView === 'dashboard' ? (
              <section className="space-y-6">
                <div className="ui-shell-panel p-5">
                  <PageHeader title="Dashboard" description="Real dashboard data can sync into this surface, with live stats and recent activity fetched from the backend." />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MiniStat label="Profile Views" value={formatNumber(dashboardData?.profileViews ?? 1842)} />
                  <MiniStat label="Connections" value={formatNumber(dashboardData?.connections ?? 286)} />
                  <MiniStat label="Messages" value={formatNumber(dashboardData?.messagesReceived ?? 91)} />
                  <MiniStat label="Engagement" value={`${dashboardData?.engagementPercent ?? 76}%`} />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MiniStat label="Total Videos" value={formatNumber(dashboardData?.totalVideos ?? 24)} />
                  <MiniStat label="Public Videos" value={formatNumber(dashboardData?.publicVideos ?? 9)} />
                  <MiniStat label="Unread Messages" value={formatNumber(dashboardData?.unreadMessages ?? 11)} />
                  <MiniStat label="Pending Reports" value={formatNumber(dashboardData?.pendingReports ?? 2)} />
                </div>
                <div className="ui-shell-panel p-5">
                  <h3 className="text-lg font-semibold text-[#EDE9FF]">Recent Activity</h3>
                  <div className="mt-4 space-y-3">
                    {[
                      'Profile updated 12 minutes ago',
                      'Three new connections accepted today',
                      'Public video crossed 1K views',
                      'One report requires moderation review',
                    ].map((item) => (
                      <div key={item} className="rounded-2xl bg-[#1E1C2E] px-4 py-3 text-sm text-[#C4BDEE]">{item}</div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}
          </section>

          {activeView === 'home' ? (
            <aside className="hidden w-full max-w-[320px] xl:block">
              <div className="sticky top-6 space-y-6">
                <section className="ui-shell-panel p-5">
                  <h2 className="text-lg font-semibold text-[#EDE9FF]">Featured Stats</h2>
                  <div className="mt-4 grid gap-3">
                    <MiniStat label="Followers" value="128.4K" />
                    <MiniStat label="Likes" value="2.8M" />
                    <MiniStat label="Video Plays" value="94.2K" />
                  </div>
                </section>
                <section className="ui-shell-panel p-5">
                  <h2 className="text-lg font-semibold text-[#EDE9FF]">Quick Links</h2>
                  <div className="mt-4 space-y-2 text-sm text-[#C4BDEE]">
                    {['Invite creator', 'Open uploads', 'Review dashboard', 'Start a room'].map((item) => (
                      <button key={item} type="button" className="ui-button-secondary w-full px-4 py-3 text-left text-sm">{item}</button>
                    ))}
                  </div>
                </section>
              </div>
            </aside>
          ) : null}
        </div>
      </main>
    </div>
  )
}