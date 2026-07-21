'use client'

import React from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { Users, Zap, Heart, TrendingUp, MapPin, Compass, Copy, ExternalLink, Thermometer, Droplets, Wind, MoonStar } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'

type DashboardViewData = {
  user: {
    id: string
    username: string
    accountName: string
    firstName: string
    displayName: string
    personalCode: string
  }
  account: {
    role: 'SUPREME_ADMIN' | 'ADMIN' | 'MODEL_VERIFIED' | 'MEMBER' | 'BURNER'
    isModelVerified: boolean
  }
  profile: {
    age: number | null
    location: string
    bio: string
    lookingFor: string[]
    interests: string[]
    avatarUrl: string
    city: string
    state: string
    country: string
    gender: string
    genderOther: string
    sexualOrientation: string
    orientationOther: string
  }
  stats: {
    profileViews: number
    connections: number
    messagesReceived: number
    engagementPercent: number
  }
  modelStats: {
    totalVideos: number
    publicVideos: number
    unreadMessages: number
    pendingReports: number
  }
  recentActivity: Array<{
    id: string
    action: string
    time: string
  }>
}

type DashboardClientProps = {
  initialData: DashboardViewData
}

type DashboardLivePayload = {
  stats: DashboardViewData['stats']
  modelStats: DashboardViewData['modelStats']
  recentActivity: DashboardViewData['recentActivity']
  generatedAt: string
}

type WeatherWidgetData = {
  locationLabel: string
  temperatureC: number
  temperatureF: number
  feelsLikeC: number
  humidity: number
  windKph: number
  weatherCode: number
  weatherLabel: string
  moonPhase: number | null
  moonPhaseLabel: string
  sunrise: string | null
  sunset: string | null
}

type WeatherWidgetState =
  | { status: 'loading' }
  | { status: 'ready'; data: WeatherWidgetData }
  | { status: 'error'; message: string }

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

function getDefaultArea(profile: DashboardViewData['profile']) {
  const cityStateCountry = [profile.city, profile.state, profile.country].filter(Boolean)

  if (cityStateCountry.length > 0) {
    return cityStateCountry.join(', ')
  }

  if (profile.location && profile.location !== 'Preview mode') {
    return profile.location
  }

  return 'Downtown'
}

function getWeatherCodeLabel(code: number): string {
  if (code === 0) return 'Clear sky'
  if (code === 1 || code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Foggy'
  if (code === 51 || code === 53 || code === 55) return 'Drizzle'
  if (code === 61 || code === 63 || code === 65) return 'Rain'
  if (code === 66 || code === 67) return 'Freezing rain'
  if (code === 71 || code === 73 || code === 75 || code === 77) return 'Snow'
  if (code === 80 || code === 81 || code === 82) return 'Rain showers'
  if (code === 85 || code === 86) return 'Snow showers'
  if (code === 95 || code === 96 || code === 99) return 'Thunderstorm'
  return 'Variable weather'
}

function getMoonPhaseLabel(phase: number | null): string {
  if (phase === null || Number.isNaN(phase)) return 'Unknown'
  if (phase < 0.03 || phase > 0.97) return 'New Moon'
  if (phase < 0.22) return 'Waxing Crescent'
  if (phase < 0.28) return 'First Quarter'
  if (phase < 0.47) return 'Waxing Gibbous'
  if (phase < 0.53) return 'Full Moon'
  if (phase < 0.72) return 'Waning Gibbous'
  if (phase < 0.78) return 'Last Quarter'
  return 'Waning Crescent'
}

function formatClock(value: string | null): string {
  if (!value) return 'Unknown'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Unknown'
  return parsed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}


export default function DashboardClient({ initialData }: DashboardClientProps) {
  const { user, profile, account } = initialData
  const defaultArea = getDefaultArea(profile)
  const [startArea, setStartArea] = React.useState(defaultArea)
  const [destination, setDestination] = React.useState('')
  const [travelMode, setTravelMode] = React.useState<'driving' | 'walking' | 'transit'>('driving')
  const [activeMapQuery, setActiveMapQuery] = React.useState(defaultArea)
  const [copied, setCopied] = React.useState(false)
  const [weatherWidget, setWeatherWidget] = React.useState<WeatherWidgetState>({ status: 'loading' })
  const [liveData, setLiveData] = React.useState<DashboardLivePayload>({
    stats: initialData.stats,
    modelStats: initialData.modelStats,
    recentActivity: initialData.recentActivity,
    generatedAt: new Date().toISOString(),
  })
  const [liveStatus, setLiveStatus] = React.useState<'idle' | 'syncing' | 'error'>('idle')

  const quickDestinations = ['Coffee shop', 'Cocktail bar', 'Lounge', 'Dinner spot', 'Hotel lobby']

  const lastUpdatedLabel = React.useMemo(() => {
    const parsed = new Date(liveData.generatedAt)
    if (Number.isNaN(parsed.getTime())) {
      return 'just now'
    }

    return parsed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }, [liveData.generatedAt])

  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(activeMapQuery)}&output=embed`
  const routeUrl = destination.trim()
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startArea)}&destination=${encodeURIComponent(destination)}&travelmode=${travelMode}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeMapQuery)}`

  const meetupSummary = destination.trim()
    ? `Meetup plan: starting around ${startArea}, destination ${destination}, mode ${travelMode}.`
    : `Meetup plan: exploring options around ${startArea}.`

  async function copyMeetupSummary() {
    try {
      await navigator.clipboard.writeText(meetupSummary)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  function searchMap() {
    if (destination.trim()) {
      setActiveMapQuery(`${startArea} to ${destination}`)
      return
    }

    setActiveMapQuery(startArea)
  }

  React.useEffect(() => {
    if (account.role === 'BURNER') {
      return
    }

    let cancelled = false

    async function syncLiveData() {
      setLiveStatus('syncing')

      try {
        const response = await fetch('/api/dashboard/live', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to refresh live dashboard')
        }

        const payload = await response.json() as DashboardLivePayload

        if (!cancelled) {
          setLiveData(payload)
          setLiveStatus('idle')
        }
      } catch {
        if (!cancelled) {
          setLiveStatus('error')
        }
      }
    }

    void syncLiveData()
    const intervalId = window.setInterval(() => {
      void syncLiveData()
    }, 30000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [account.role])

  const isStaff = account.role === 'ADMIN' || account.role === 'SUPREME_ADMIN'

  const statCards = [
    {
      title: 'Video Views',
      value: liveData.stats.profileViews.toLocaleString(),
      detail: 'Total plays across your videos',
      icon: TrendingUp,
      gradient: 'from-cyan-400 via-sky-500 to-blue-600',
    },
    {
      title: 'Connections',
      value: liveData.stats.connections.toLocaleString(),
      detail: 'Accepted connections',
      icon: Users,
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      href: ROUTES.FRIENDS,
    },
    {
      title: 'Messages Received',
      value: liveData.stats.messagesReceived.toLocaleString(),
      detail: 'Received in the last 30 days',
      icon: Heart,
      gradient: 'from-orange-400 via-rose-500 to-pink-600',
      href: ROUTES.MESSAGES,
    },
    {
      title: 'Engagement',
      value: `${liveData.stats.engagementPercent}%`,
      detail: 'Read rate on received messages',
      icon: Zap,
      gradient: 'from-fuchsia-400 via-violet-500 to-indigo-600',
    },
  ]

  const modelCards = [
    {
      title: 'Videos Uploaded',
      value: liveData.modelStats.totalVideos.toLocaleString(),
      detail: 'All uploaded clips',
      href: ROUTES.MY_VIDEOS,
    },
    {
      title: 'Public Videos',
      value: liveData.modelStats.publicVideos.toLocaleString(),
      detail: 'Visible to members',
      href: ROUTES.MY_VIDEOS,
    },
    {
      title: 'Unread Messages',
      value: liveData.modelStats.unreadMessages.toLocaleString(),
      detail: 'Need your response',
      href: ROUTES.MESSAGES,
    },
    {
      title: 'Pending Reports',
      value: liveData.modelStats.pendingReports.toLocaleString(),
      detail: 'Safety queue items',
      href: isStaff ? ROUTES.ADMIN : undefined,
    },
  ].filter((card) => card.title !== 'Pending Reports' || isStaff)

  const toolDirectory = [
    { label: 'Dashboard', href: ROUTES.DASHBOARD, tone: 'border-sky-300/30 bg-sky-400/10 text-sky-100' },
    { label: 'Profile', href: ROUTES.ME_PROFILE, tone: 'border-violet-300/30 bg-violet-400/10 text-violet-100' },
    { label: 'Messages', href: ROUTES.MESSAGES, tone: 'border-amber-300/30 bg-amber-300/10 text-amber-100' },
    { label: 'Friends', href: ROUTES.FRIENDS, tone: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100' },
    { label: 'Member Search', href: ROUTES.SEARCH, tone: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-100' },
    { label: 'Camera', href: ROUTES.CAMERA, tone: 'border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-100' },
    { label: 'Videos', href: ROUTES.VIDEOS, tone: 'border-rose-300/30 bg-rose-400/10 text-rose-100' },
    { label: 'Settings', href: ROUTES.SETTINGS, tone: 'border-indigo-300/30 bg-indigo-400/10 text-indigo-100' },
    { label: 'Community', href: ROUTES.COMMUNITY, tone: 'border-teal-300/30 bg-teal-400/10 text-teal-100' },
    { label: 'Help', href: ROUTES.HELP, tone: 'border-stone-300/30 bg-stone-400/10 text-stone-100' },
  ]

  React.useEffect(() => {
    let cancelled = false

    async function loadWeatherWidget() {
      setWeatherWidget({ status: 'loading' })

      try {
        const areaQuery = [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || profile.location || defaultArea
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(areaQuery)}&count=1&language=en&format=json`
        const geocodeResponse = await fetch(geocodeUrl)
        if (!geocodeResponse.ok) {
          throw new Error('Could not resolve location')
        }

        const geocode = await geocodeResponse.json() as {
          results?: Array<{ latitude: number; longitude: number; name: string; admin1?: string; country?: string }>
        }
        const match = geocode.results?.[0]
        if (!match) {
          throw new Error('No weather station found for your area')
        }

        const locationLabel = [match.name, match.admin1, match.country].filter(Boolean).join(', ')
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${match.latitude}&longitude=${match.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=moon_phase,sunrise,sunset&forecast_days=1&timezone=auto`
        const weatherResponse = await fetch(weatherUrl)
        if (!weatherResponse.ok) {
          throw new Error('Could not fetch weather data')
        }

        const payload = await weatherResponse.json() as {
          current?: {
            temperature_2m?: number
            relative_humidity_2m?: number
            apparent_temperature?: number
            weather_code?: number
            wind_speed_10m?: number
          }
          daily?: {
            moon_phase?: number[]
            sunrise?: string[]
            sunset?: string[]
          }
        }

        const temperatureC = Math.round(payload.current?.temperature_2m ?? 0)
        const feelsLikeC = Math.round(payload.current?.apparent_temperature ?? temperatureC)
        const humidity = Math.round(payload.current?.relative_humidity_2m ?? 0)
        const windKph = Math.round(payload.current?.wind_speed_10m ?? 0)
        const weatherCode = payload.current?.weather_code ?? 0
        const moonPhase = payload.daily?.moon_phase?.[0] ?? null

        const data: WeatherWidgetData = {
          locationLabel,
          temperatureC,
          temperatureF: Math.round((temperatureC * 9) / 5 + 32),
          feelsLikeC,
          humidity,
          windKph,
          weatherCode,
          weatherLabel: getWeatherCodeLabel(weatherCode),
          moonPhase,
          moonPhaseLabel: getMoonPhaseLabel(moonPhase),
          sunrise: payload.daily?.sunrise?.[0] ?? null,
          sunset: payload.daily?.sunset?.[0] ?? null,
        }

        if (!cancelled) {
          setWeatherWidget({ status: 'ready', data })
        }
      } catch {
        if (!cancelled) {
          setWeatherWidget({
            status: 'error',
            message: 'Weather and moon data are unavailable right now.',
          })
        }
      }
    }

    void loadWeatherWidget()

    return () => {
      cancelled = true
    }
  }, [defaultArea, profile.city, profile.country, profile.location, profile.state])

  return (
    <div className="relative min-h-screen overflow-hidden p-4 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Top Section */}
        <motion.div variants={itemVariants}>
          <div className="mb-6 rounded-2xl border border-cyan-200/20 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-cyan-950/50 p-4 shadow-[0_16px_60px_-30px_rgba(56,189,248,0.45)] backdrop-blur-md md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 md:items-end">
              <div className="max-w-2xl space-y-1.5">
                <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/70">Verified Model Dashboard</p>
                <h1 className="text-2xl font-semibold text-white md:text-3xl">Your Command Center</h1>
                <p className="text-sm text-slate-200/75">Views, profile completion, and social activity at a glance.</p>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <Badge className="border border-cyan-300/30 bg-cyan-500/15 text-cyan-100">Live API</Badge>
                  <Badge className="border border-white/15 bg-white/5 text-slate-200">Updated {lastUpdatedLabel}</Badge>
                  {liveStatus === 'syncing' && (
                    <Badge className="border border-amber-300/30 bg-amber-400/10 text-amber-100">Syncing</Badge>
                  )}
                  {liveStatus === 'error' && (
                    <Badge className="border border-rose-300/30 bg-rose-500/15 text-rose-100">Sync failed</Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={ROUTES.SEARCH}
                  className="rounded-xl border border-sky-300/30 bg-sky-400/10 px-3 py-2 text-[11px] font-semibold text-sky-100 transition hover:bg-sky-300/15"
                >
                  Discover Members
                </Link>
                <Link
                  href={ROUTES.FRIENDS}
                  className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-[11px] font-semibold text-emerald-100 transition hover:bg-emerald-300/15"
                >
                  View Friends
                </Link>
                <Link
                  href={ROUTES.MESSAGES}
                  className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-[11px] font-semibold text-amber-100 transition hover:bg-amber-200/15"
                >
                  Open Messages
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            const cardContent = (
              <Card className="bg-gradient-to-br from-bg-surface/50 to-bg-surface/20 border-border-subtle/50 transition-colors hover:border-primary/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-text-muted">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-text-primary">{stat.value}</div>
                  <p className="mt-2 text-xs text-text-muted">{stat.detail}</p>
                </CardContent>
              </Card>
            )

            return (
              <motion.div
                key={index}
                whileHover={stat.href ? { y: -5, boxShadow: '0 20px 25px -5 rgba(0, 0, 0, 0.3)' } : undefined}
                transition={{ duration: 0.2 }}
              >
                {stat.href ? (
                  <Link href={stat.href} className="block cursor-pointer">
                    {cardContent}
                  </Link>
                ) : (
                  cardContent
                )}
              </motion.div>
            )
          })}
        </motion.div>

        {/* Model + Moderation Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modelCards.map((stat) => {
            const card = (
              <Card className="border-border-subtle/50 bg-black/20 backdrop-blur transition-colors hover:border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-text-muted">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-text-primary">{stat.value}</p>
                  <p className="mt-1 text-xs text-text-muted">{stat.detail}</p>
                </CardContent>
              </Card>
            )

            if (!stat.href) {
              return (
                <div key={stat.title} className="rounded-xl">
                  {card}
                </div>
              )
            }

            return (
              <Link
                key={stat.title}
                href={stat.href}
                className="block cursor-pointer rounded-xl transition-transform hover:-translate-y-1"
              >
                {card}
              </Link>
            )
          })}
        </motion.div>

        {/* Tool Directory */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-bg-surface/50 to-bg-surface/20 border-border-subtle/50">
            <CardHeader>
              <CardTitle>Tool Directory</CardTitle>
              <CardDescription>Find every core member tool from one place</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {toolDirectory.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition hover:opacity-90 ${tool.tone}`}
                  >
                    {tool.label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Overview */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gradient-to-br from-bg-surface/50 to-bg-surface/20 border-border-subtle/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-burgundy-500/10 via-transparent to-champagne/10 pointer-events-none" />
              <CardHeader>
                <CardTitle className="text-2xl">Your Profile</CardTitle>
                <CardDescription>Your public profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-text-muted mb-1">Display Name</p>
                    <p className="text-lg font-semibold text-text-primary">{user.displayName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">Username</p>
                    <p className="text-lg font-semibold text-text-primary">@{user.username}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-text-muted mb-1">Member Marker</p>
                  <p className="text-base font-semibold text-champagne">{user.accountName} + @{user.username}</p>
                </div>

                {profile.bio && (
                  <div>
                    <p className="text-sm text-text-muted mb-2">Bio</p>
                    <p className="text-text-primary">{profile.bio}</p>
                  </div>
                )}

                {profile.location && (
                  <div>
                    <p className="text-sm text-text-muted mb-1">Location</p>
                    <p className="text-text-primary">{profile.location}</p>
                  </div>
                )}

                {profile.age && (
                  <div className="flex gap-4">
                    <div>
                      <p className="text-sm text-text-muted mb-1">Age</p>
                      <p className="text-text-primary">{profile.age}</p>
                    </div>
                    {profile.gender && (
                      <div>
                        <p className="text-sm text-text-muted mb-1">Gender</p>
                        <p className="text-text-primary capitalize">{profile.gender}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Interests Card */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-bg-surface/50 to-bg-surface/20 border-border-subtle/50 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.map((interest, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge variant="secondary" className="bg-champagne/20 text-champagne hover:bg-champagne/30">
                          {interest}
                        </Badge>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-sm text-text-muted">No interests added yet</p>
                  )}
                </div>

                {profile.lookingFor && profile.lookingFor.length > 0 && (
                  <div className="pt-4 border-t border-border-subtle">
                    <p className="text-sm font-semibold text-text-muted mb-2">Looking For</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.lookingFor.map((item, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge variant="default" className="bg-burgundy-600 text-white hover:bg-burgundy-700">
                            {item}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-bg-surface/50 to-bg-surface/20 border-border-subtle/50">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your activity over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveData.recentActivity.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between py-3 border-b border-border-subtle/30 last:border-0"
                  >
                    <p className="text-text-primary">{activity.action}</p>
                    <p className="text-xs text-text-muted">{activity.time}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Moon Phase + Weather */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-bg-surface/50 to-bg-surface/20 border-border-subtle/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MoonStar className="h-5 w-5 text-champagne" />
                Moon and Local Weather
              </CardTitle>
              <CardDescription>Live snapshot for your area</CardDescription>
            </CardHeader>
            <CardContent>
              {weatherWidget.status === 'loading' && (
                <div className="rounded-xl border border-border-subtle/40 bg-black/10 p-4 text-sm text-text-muted">
                  Loading weather and moon phase...
                </div>
              )}

              {weatherWidget.status === 'error' && (
                <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                  {weatherWidget.message}
                </div>
              )}

              {weatherWidget.status === 'ready' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border-subtle/40 bg-black/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Location</p>
                    <p className="mt-1 text-sm text-text-primary">{weatherWidget.data.locationLabel}</p>
                    <p className="mt-2 text-xs text-text-muted">{weatherWidget.data.weatherLabel}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border-subtle/40 bg-black/10 p-4">
                      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-muted">
                        <Thermometer className="h-4 w-4" /> Temp
                      </p>
                      <p className="mt-2 text-xl font-semibold text-text-primary">
                        {weatherWidget.data.temperatureC}C / {weatherWidget.data.temperatureF}F
                      </p>
                      <p className="mt-1 text-xs text-text-muted">Feels like {weatherWidget.data.feelsLikeC}C</p>
                    </div>

                    <div className="rounded-xl border border-border-subtle/40 bg-black/10 p-4">
                      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-muted">
                        <Droplets className="h-4 w-4" /> Humidity
                      </p>
                      <p className="mt-2 text-xl font-semibold text-text-primary">{weatherWidget.data.humidity}%</p>
                      <p className="mt-1 text-xs text-text-muted">Weather code {weatherWidget.data.weatherCode}</p>
                    </div>

                    <div className="rounded-xl border border-border-subtle/40 bg-black/10 p-4">
                      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-muted">
                        <Wind className="h-4 w-4" /> Wind
                      </p>
                      <p className="mt-2 text-xl font-semibold text-text-primary">{weatherWidget.data.windKph} km/h</p>
                      <p className="mt-1 text-xs text-text-muted">Sunrise {formatClock(weatherWidget.data.sunrise)}</p>
                    </div>

                    <div className="rounded-xl border border-border-subtle/40 bg-black/10 p-4">
                      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-muted">
                        <MoonStar className="h-4 w-4" /> Moon
                      </p>
                      <p className="mt-2 text-xl font-semibold text-text-primary">{weatherWidget.data.moonPhaseLabel}</p>
                      <p className="mt-1 text-xs text-text-muted">Sunset {formatClock(weatherWidget.data.sunset)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Map Planner */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-border-subtle/50 bg-gradient-to-br from-bg-surface/50 to-bg-surface/20">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MapPin className="h-5 w-5 text-champagne" />
                    Map Planner
                  </CardTitle>
                  <CardDescription>Plan meetups without leaving your dashboard.</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-100">
                  Area-first privacy
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="md:col-span-1">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-text-muted">Start Area</p>
                  <Input
                    value={startArea}
                    onChange={(event) => setStartArea(event.target.value)}
                    placeholder="City, state, or district"
                  />
                </div>
                <div className="md:col-span-1">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-text-muted">Destination</p>
                  <Input
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    placeholder="Coffee shop near Midtown"
                  />
                </div>
                <div className="md:col-span-1">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-text-muted">Travel Mode</p>
                  <div className="flex gap-2">
                    {(['driving', 'walking', 'transit'] as const).map((mode) => (
                      <Button
                        key={mode}
                        type="button"
                        variant={travelMode === mode ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTravelMode(mode)}
                        className="capitalize"
                      >
                        {mode}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {quickDestinations.map((spot) => (
                  <Button
                    key={spot}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDestination(`${spot} near ${startArea}`)
                    }}
                  >
                    {spot}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" onClick={searchMap} className="gap-2">
                  <Compass className="h-4 w-4" />
                  Update Map
                </Button>
                <Button type="button" variant="outline" onClick={copyMeetupSummary} className="gap-2">
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied' : 'Copy Meetup Plan'}
                </Button>
                <a
                  href={routeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex"
                >
                  <Button type="button" variant="secondary" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open Full Map
                  </Button>
                </a>
              </div>

              <div className="rounded-xl border border-border-subtle/60 bg-black/10 p-2">
                <iframe
                  title="Member meetup map"
                  src={mapEmbedUrl}
                  className="h-[320px] w-full rounded-lg border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="rounded-lg border border-amber-300/30 bg-amber-400/10 p-3 text-xs text-amber-100">
                Keep exact addresses in direct messages only after both members agree. Start with city or district-level planning by default.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
