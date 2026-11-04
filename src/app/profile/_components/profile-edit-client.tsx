'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'

import MemberLayout from '@/app/_layouts/member-layout'
import { deleteMemberMedia, fetchMemberProfile, updateMemberProfile } from '@/lib/api'
import {
  GENDER_OPTIONS,
  INTEREST_TAG_OPTIONS,
  LOOKING_FOR_MAX_SELECTIONS,
  LOOKING_FOR_OPTIONS,
  ORIENTATION_OPTIONS,
  PRONOUNS_OPTIONS,
  ROUTES,
} from '@/lib/constants'
import { uploadProfilePhotos, uploadProfileVideos } from '@/lib/photo-upload'
import type { MemberProfileResponse } from '@/lib/types'

function toggleList(value: string, values: string[], max?: number) {
  if (values.includes(value)) {
    return values.filter((entry) => entry !== value)
  }
  if (typeof max === 'number' && values.length >= max) {
    return values
  }
  return [...values, value]
}

export default function ProfileEditClient() {
  const [data, setData] = useState<MemberProfileResponse | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [gender, setGender] = useState('')
  const [genderOther, setGenderOther] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [sexualOrientation, setSexualOrientation] = useState('')
  const [orientationOther, setOrientationOther] = useState('')
  const [lookingFor, setLookingFor] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [avatarUrl, setAvatarUrl] = useState('')
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [videoUrls, setVideoUrls] = useState<string[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'photo' | 'video' | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const response = await fetchMemberProfile()
        if (!mounted) return

        setData(response)
        setDisplayName(response.user.displayName || '')
        setBio(response.profile.bio || '')
        setCity(response.profile.city || '')
        setState(response.profile.state || '')
        setCountry(response.profile.country || '')
        setGender(response.profile.gender || '')
        setGenderOther(response.profile.genderOther || '')
        setPronouns(response.profile.pronouns || '')
        setSexualOrientation(response.profile.sexualOrientation || '')
        setOrientationOther(response.profile.orientationOther || '')
        setLookingFor(response.profile.lookingFor || [])
        setInterests(response.profile.interests || [])
        setAvatarUrl(response.profile.avatarUrl || '')
        setPhotoUrls(response.profile.photoUrls || [])
        setVideoUrls(response.profile.videoUrls || [])
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Could not load profile.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()
    return () => {
      mounted = false
    }
  }, [])

  const mediaPolicy = data?.media.policy
  const publicProfileHref = data?.user.username ? `/u/${data.user.username}` : ROUTES.ME

  const sidebarUser = useMemo(
    () => ({
      username: data?.user.username || 'member',
      firstName: displayName || data?.user.username || 'Member',
      displayName: displayName || data?.user.displayName || 'Member',
      avatarUrl: avatarUrl || undefined,
      profileHref: ROUTES.PROFILE_VIEW,
    }),
    [avatarUrl, data, displayName]
  )

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const updated = await updateMemberProfile({
        displayName: displayName.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        gender,
        genderOther: gender === 'Other' ? genderOther.trim() : '',
        pronouns,
        sexualOrientation,
        orientationOther: sexualOrientation === 'Other' ? orientationOther.trim() : '',
        lookingFor,
        interests,
        bio: bio.trim(),
        avatarUrl: avatarUrl || photoUrls[0] || '',
        photoUrls,
        videoUrls,
      })

      setData(updated)
      setMessage('Profile saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePhotoUpload(files: FileList | null) {
    if (!files?.length || !data) return

    setUploading('photo')
    setError('')
    setMessage('')

    try {
      const newUrls = await uploadProfilePhotos(data.user.id, files)
      setPhotoUrls((previous) => Array.from(new Set([...newUrls, ...previous])))
      if (!avatarUrl && newUrls[0]) {
        setAvatarUrl(newUrls[0])
      }
      setMessage(`${newUrls.length} photo${newUrls.length === 1 ? '' : 's'} uploaded. Save to confirm avatar if you changed it.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo upload failed.')
    } finally {
      setUploading(null)
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }

  async function handleVideoUpload(files: FileList | null) {
    if (!files?.length || !data) return

    setUploading('video')
    setError('')
    setMessage('')

    try {
      const newUrls = await uploadProfileVideos(data.user.id, files)
      setVideoUrls((previous) => Array.from(new Set([...newUrls, ...previous])))
      setMessage(`${newUrls.length} video${newUrls.length === 1 ? '' : 's'} uploaded.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video upload failed.')
    } finally {
      setUploading(null)
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  async function removePhoto(url: string) {
    setError('')
    try {
      await deleteMemberMedia('photo', url)
      setPhotoUrls((previous) => previous.filter((entry) => entry !== url))
      if (avatarUrl === url) {
        setAvatarUrl('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove photo.')
    }
  }

  async function removeVideo(url: string) {
    setError('')
    try {
      await deleteMemberMedia('video', url)
      setVideoUrls((previous) => previous.filter((entry) => entry !== url))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove video.')
    }
  }

  return (
    <MemberLayout initialUser={sidebarUser}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted">Profile builder</p>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">Edit your profile</h1>
            <p className="mt-1 text-sm text-text-muted">
              Add photos and details members see on{' '}
              <Link href={publicProfileHref} className="underline underline-offset-2">
                your public page
              </Link>
              .
            </p>
          </div>
          <Link
            href={ROUTES.PROFILE_VIEW}
            className="rounded-xl border border-border-subtle px-4 py-2 text-sm text-text-muted hover:text-text-primary"
          >
            Preview
          </Link>
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-text-muted">Loading profile…</p>
        ) : (
          <form onSubmit={handleSave} className="mt-8 space-y-8">
            <section className="rounded-2xl border border-border-subtle bg-bg-card/80 p-5">
              <h2 className="text-sm font-semibold text-text-primary">Photos</h2>
              <p className="mt-1 text-xs text-text-muted">
                {mediaPolicy?.maxPhotos === null
                  ? 'Unlimited photos'
                  : `${photoUrls.length} / ${mediaPolicy?.maxPhotos ?? '—'} photos`}
                {mediaPolicy?.tier ? ` · ${mediaPolicy.tier} plan` : ''}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {photoUrls.map((url) => (
                  <div key={url} className="relative">
                    <button
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`block h-24 w-24 overflow-hidden rounded-xl border-2 ${
                        avatarUrl === url ? 'border-[#7C5CFC]' : 'border-border-subtle'
                      }`}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void removePhoto(url)}
                      className="absolute -right-1 -top-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-text-muted">Tap a photo to use it as your avatar.</p>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="mt-3 block w-full text-sm text-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-[#7C5CFC] file:px-3 file:py-2 file:text-sm file:text-white"
                onChange={(event) => void handlePhotoUpload(event.target.files)}
                disabled={uploading !== null}
              />
              {uploading === 'photo' ? <p className="mt-2 text-xs text-text-muted">Uploading…</p> : null}
            </section>

            {mediaPolicy?.allowVideos ? (
              <section className="rounded-2xl border border-border-subtle bg-bg-card/80 p-5">
                <h2 className="text-sm font-semibold text-text-primary">Videos</h2>
                <p className="mt-1 text-xs text-text-muted">
                  {mediaPolicy.maxVideos === null
                    ? 'Unlimited videos'
                    : `${videoUrls.length} / ${mediaPolicy.maxVideos} videos`}
                </p>
                <ul className="mt-3 space-y-2">
                  {videoUrls.map((url) => (
                    <li key={url} className="flex items-center justify-between gap-2 rounded-lg bg-bg-surface px-3 py-2 text-xs">
                      <span className="truncate text-text-muted">{url.split('/').pop()}</span>
                      <button
                        type="button"
                        onClick={() => void removeVideo(url)}
                        className="shrink-0 text-rose-300 hover:text-rose-200"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="mt-3 block w-full text-sm text-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-[#7C5CFC] file:px-3 file:py-2 file:text-sm file:text-white"
                  onChange={(event) => void handleVideoUpload(event.target.files)}
                  disabled={uploading !== null}
                />
                {uploading === 'video' ? <p className="mt-2 text-xs text-text-muted">Uploading…</p> : null}
              </section>
            ) : null}

            <section className="space-y-4 rounded-2xl border border-border-subtle bg-bg-card/80 p-5">
              <h2 className="text-sm font-semibold text-text-primary">About you</h2>
              <label className="block text-xs text-text-muted">
                Display name
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-primary"
                  required
                />
              </label>
              <label className="block text-xs text-text-muted">
                Bio
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-primary"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block text-xs text-text-muted">
                  City
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-surface px-3 py-2 text-sm"
                    required
                  />
                </label>
                <label className="block text-xs text-text-muted">
                  State / region
                  <input
                    value={state}
                    onChange={(event) => setState(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-surface px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs text-text-muted">
                  Country
                  <input
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-surface px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <label className="block text-xs text-text-muted">
                Pronouns
                <select
                  value={pronouns}
                  onChange={(event) => setPronouns(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-surface px-3 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  {PRONOUNS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-text-muted">
                Gender
                <select
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-surface px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select…</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              {gender === 'Other' ? (
                <label className="block text-xs text-text-muted">
                  Gender (other)
                  <input
                    value={genderOther}
                    onChange={(event) => setGenderOther(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-surface px-3 py-2 text-sm"
                  />
                </label>
              ) : null}
              <label className="block text-xs text-text-muted">
                Orientation
                <select
                  value={sexualOrientation}
                  onChange={(event) => setSexualOrientation(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-surface px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select…</option>
                  {ORIENTATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="rounded-2xl border border-border-subtle bg-bg-card/80 p-5">
              <h2 className="text-sm font-semibold text-text-primary">
                Looking for (max {LOOKING_FOR_MAX_SELECTIONS})
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {LOOKING_FOR_OPTIONS.map((option) => {
                  const active = lookingFor.includes(option)
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLookingFor((current) => toggleList(option, current, LOOKING_FOR_MAX_SELECTIONS))}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        active
                          ? 'border-[#7C5CFC] bg-[#7C5CFC]/20 text-text-primary'
                          : 'border-border-subtle text-text-muted'
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-border-subtle bg-bg-card/80 p-5">
              <h2 className="text-sm font-semibold text-text-primary">Interests</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {INTEREST_TAG_OPTIONS.map((option) => {
                  const active = interests.includes(option)
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setInterests((current) => toggleList(option, current))}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        active
                          ? 'border-[#7C5CFC] bg-[#7C5CFC]/20 text-text-primary'
                          : 'border-border-subtle text-text-muted'
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </section>

            {error ? (
              <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            ) : null}
            {message ? (
              <p role="status" className="rounded-xl border border-emerald-400/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={saving || uploading !== null}
              className="w-full rounded-xl bg-[#7C5CFC] py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        )}
      </div>
    </MemberLayout>
  )
}
