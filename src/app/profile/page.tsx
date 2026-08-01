'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { FormEvent, useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

import MemberLayout from '@/app/_layouts/member-layout'
import PhotoCropUpload from '@/app/profile/PhotoCropUpload'
import ProfileGallery from '@/app/profile/ProfileGallery'

import { uploadProfilePhotos } from '@/lib/photo-upload'
import { useCallback } from 'react'
import { fetchMemberProfile, updateMemberProfile } from '@/lib/api'
import {
  GENDER_OPTIONS,
  INTEREST_TAG_OPTIONS,
  KINK_OPTIONS,
  LOOKING_FOR_MAX_SELECTIONS,
  LOOKING_FOR_OPTIONS,
  ORIENTATION_OPTIONS,
  ROUTES,
} from '@/lib/constants'

type ProfileForm = {
  name: string
  avatarUrl: string
  city: string
  state: string
  country: string
  gender: string
  genderOther: string
  sexualOrientation: string
  orientationOther: string
  lookingFor: string[]
  interests: string[]
  kinks: string[]
  bio: string
}

const EMPTY_FORM: ProfileForm = {
  name: '',
  avatarUrl: '',
  city: '',
  state: '',
  country: '',
  gender: '',
  genderOther: '',
  sexualOrientation: '',
  orientationOther: '',
  lookingFor: [],
  interests: [],
  kinks: [],
  bio: '',
}


function toggleArrayItem(arr: string[], item: string): string[] {
  const normalizedItem = item.trim().toLowerCase()
  const hasItem = arr.some((value) => value.trim().toLowerCase() === normalizedItem)

  if (hasItem) {
    return arr.filter((value) => value.trim().toLowerCase() !== normalizedItem)
  }

  return [...arr, item]
}

function hasValueCaseInsensitive(items: string[], candidate: string): boolean {
  const normalizedCandidate = candidate.trim().toLowerCase()
  return items.some((item) => item.trim().toLowerCase() === normalizedCandidate)
}

function ProfileContent() {
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM)
  const [username, setUsername] = useState('')
  const [memberRole, setMemberRole] = useState('MEMBER')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [customLookingFor, setCustomLookingFor] = useState('')
  const [customInterest, setCustomInterest] = useState('')
  const [customKink, setCustomKink] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const response = await fetchMemberProfile()

        if (!mounted) return

        if (response.user.role === 'MODEL_VERIFIED') {
          router.replace(ROUTES.DASHBOARD)
          return
        }

        setUsername(response.user.username)
        setMemberRole(response.user.role || 'MEMBER')
        setForm({
          name: response.user.displayName || '',
          avatarUrl: response.profile.avatarUrl || '',
          city: response.profile.city || '',
          state: response.profile.state || '',
          country: response.profile.country || '',
          gender: response.profile.gender || '',
          genderOther: response.profile.genderOther || '',
          sexualOrientation: response.profile.sexualOrientation || '',
          orientationOther: response.profile.orientationOther || '',
          lookingFor: response.profile.lookingFor || [],
          interests: response.profile.interests || [],
          kinks: response.profile.kinks || [],
          bio: response.profile.bio || '',
        })
        setPhotoUrls((response.profile.photoUrls as string[] | undefined) || [])
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Unable to load profile.')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [router])

  const handlePhotoUpload = useCallback(async (files: FileList) => {
    setError('')
    setMessage('')
    if (!files || files.length === 0) return
    if (!username) {
      setError('You must be logged in to upload photos.')
      return
    }
    setMessage('Uploading...')
    try {
      const urls = await uploadProfilePhotos(username, files)
      setPhotoUrls((prev) => [...urls, ...prev])
      setMessage('Photo(s) uploaded!')
      // Optionally, update profile on server with new photoUrls
      // await updateMemberProfile({ ...form, photoUrls: [...urls, ...photoUrls] })
    } catch (err: any) {
      setError(err?.message || 'Photo upload failed.')
      setMessage('')
    }
  }, [username, form, photoUrls])

  function handleChange(key: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
    setMessage('')
  }

  function addCustomLookingFor() {
    const value = customLookingFor.trim()
    if (!value) {
      return
    }

    if (hasValueCaseInsensitive(form.lookingFor, value)) {
      setCustomLookingFor('')
      return
    }

    if (form.lookingFor.length >= LOOKING_FOR_MAX_SELECTIONS) {
      setError(`You can select up to ${LOOKING_FOR_MAX_SELECTIONS} looking-for tags.`)
      return
    }

    setForm((prev) => ({
      ...prev,
      lookingFor: [...prev.lookingFor, value],
    }))
    setCustomLookingFor('')
    setError('')
  }

  function addCustomInterest() {
    const value = customInterest.trim()
    if (!value) {
      return
    }

    if (hasValueCaseInsensitive(form.interests, value)) {
      setCustomInterest('')
      return
    }

    setForm((prev) => ({
      ...prev,
      interests: [...prev.interests, value],
    }))
    setCustomInterest('')
    setError('')
  }

  function addCustomKink() {
    const value = customKink.trim()
    if (!value) {
      return
    }

    if (hasValueCaseInsensitive(form.kinks, value)) {
      setCustomKink('')
      return
    }

    setForm((prev) => ({
      ...prev,
      kinks: [...prev.kinks, value],
    }))
    setCustomKink('')
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSaving) return

    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      await updateMemberProfile({
        displayName: form.name,
        avatarUrl: form.avatarUrl || undefined,
        photoUrls,
        city: form.city,
        state: form.state || undefined,
        country: form.country || undefined,
        gender: form.gender,
        genderOther: form.genderOther || undefined,
        sexualOrientation: form.sexualOrientation,
        orientationOther: form.orientationOther || undefined,
        lookingFor: form.lookingFor,
        interests: form.interests,
        kinks: form.kinks,
        bio: form.bio || undefined,
      })
      setMessage('Profile saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const inputCls =
    'w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-stone-100 placeholder-stone-500 outline-none transition focus:border-white/35 focus:bg-black/50'

  const selectCls =
    'w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-white/35 focus:bg-black/50'

  const sidebarDisplayName = form.name.trim() || username || 'Member'

  return (
    <MemberLayout
      initialUser={{
        username: username || 'member',
        firstName: sidebarDisplayName,
        displayName: sidebarDisplayName,
        profileHref: ROUTES.PROFILE,
      }}
    >
      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-8 pt-8 text-stone-100 sm:px-6 lg:px-8 profile-sexy-font">
        <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">Profile workspace</p>
              <h1 className="mt-2 text-2xl font-semibold text-stone-100">Edit My Profile</h1>
              <p className="mt-2 max-w-2xl text-sm text-stone-400">
                This page is for changing your details, tags, bio, and media. Your member-facing profile lives on a separate view page.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-violet-300/30 bg-violet-400/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-violet-200/80">Current mode</p>
                <p className="mt-1 text-sm font-semibold text-violet-100">Edit my profile</p>
                <p className="mt-1 text-xs text-violet-100/70">Update fields, save changes, manage media.</p>
              </div>
              <Link
                href={ROUTES.PROFILE_VIEW}
                className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 transition hover:border-white/30 hover:bg-white/[0.08]"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400">Separate page</p>
                <p className="mt-1 text-sm font-semibold text-stone-100">View my profile</p>
                <p className="mt-1 text-xs text-stone-400">See the read-only profile members should experience.</p>
              </Link>
            </div>
          </div>
        </div>

        {searchParams.get('prompt') === 'nametag' && !isLoading && (
          <div className="rounded-3xl border border-amber-400/25 bg-amber-400/10 p-5 text-amber-100 shadow-[0_12px_30px_rgba(251,191,36,0.15)]">
            <p className="text-sm font-semibold">Choose a nametag</p>
            <p className="mt-2 text-sm text-amber-100/80">
              Give your account a display name so other members can recognize you.
            </p>
          </div>
        )}

        {!isLoading && (
          <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">Standard Member Profile</p>
                <p className="mt-1 text-xs text-stone-500">Role: {memberRole}</p>
                <p className="mt-1 text-sm text-stone-300">
                  Start a private 1-on-1 room or a public broadcast with live text chat.
                </p>
              </div>
              <Link
                href={ROUTES.PROFILE_CAM}
                className="rounded-xl border border-white/20 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]"
              >
                Open Cam Room
              </Link>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur-xl">
            <p className="text-sm text-stone-400">Loading your profile&hellip;</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <form onSubmit={handleSubmit} className="flex-1 space-y-5">

            {/* Identity */}
            <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl sm:p-7">
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">Identity</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs text-stone-400" htmlFor="name">
                    Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="How you appear to other members"
                    required
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs text-stone-400" htmlFor="avatarUrl">
                    Avatar URL
                  </label>
                  <input
                    id="avatarUrl"
                    type="url"
                    value={form.avatarUrl}
                    onChange={(e) => handleChange('avatarUrl', e.target.value)}
                    placeholder="https://…"
                    className={inputCls}
                  />
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl sm:p-7">
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">Location</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs text-stone-400" htmlFor="city">
                    City <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="City"
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-stone-400" htmlFor="state">
                    State / Province
                  </label>
                  <input
                    id="state"
                    type="text"
                    value={form.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="State"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-stone-400" htmlFor="country">
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={form.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="Country"
                    className={inputCls}
                  />
                </div>
              </div>
            </section>

            {/* Gender & orientation */}
            <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl sm:p-7">
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">Gender &amp; orientation</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-stone-400" htmlFor="gender">
                    Gender <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="gender"
                    value={form.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    required
                    className={selectCls}
                  >
                    <option value="" disabled className="bg-[#0f121a]">Select…</option>
                    {GENDER_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#0f121a]">{opt}</option>
                    ))}
                  </select>
                </div>
                {form.gender === 'Other' && (
                  <div>
                    <label className="mb-1.5 block text-xs text-stone-400" htmlFor="genderOther">
                      Describe your gender <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="genderOther"
                      type="text"
                      value={form.genderOther}
                      onChange={(e) => handleChange('genderOther', e.target.value)}
                      required
                      className={inputCls}
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-xs text-stone-400" htmlFor="sexualOrientation">
                    Sexual orientation <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="sexualOrientation"
                    value={form.sexualOrientation}
                    onChange={(e) => handleChange('sexualOrientation', e.target.value)}
                    required
                    className={selectCls}
                  >
                    <option value="" disabled className="bg-[#0f121a]">Select…</option>
                    {ORIENTATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#0f121a]">{opt}</option>
                    ))}
                  </select>
                </div>
                {form.sexualOrientation === 'Other' && (
                  <div>
                    <label className="mb-1.5 block text-xs text-stone-400" htmlFor="orientationOther">
                      Describe your orientation <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="orientationOther"
                      type="text"
                      value={form.orientationOther}
                      onChange={(e) => handleChange('orientationOther', e.target.value)}
                      required
                      className={inputCls}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Looking for */}
            <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl sm:p-7">
              <div className="flex items-baseline justify-between">
                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">
                  Looking for (who you seek) <span className="text-rose-400">*</span>
                </p>
                <span className="text-[10px] text-stone-500">{form.lookingFor.length}/{LOOKING_FOR_MAX_SELECTIONS}</span>
              </div>
              <p className="mt-3 text-xs text-stone-400">
                Pick your ideal person or role dynamic (for example: top, bottom, switch, furry, co-performer).
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {LOOKING_FOR_OPTIONS.map((opt) => {
                  const active = hasValueCaseInsensitive(form.lookingFor, opt)
                  const atCap = form.lookingFor.length >= LOOKING_FOR_MAX_SELECTIONS
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={!active && atCap}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          lookingFor: toggleArrayItem(prev.lookingFor, opt),
                        }))
                      }
                      className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                        active
                          ? 'border-amber-400/40 bg-amber-400/[0.12] text-amber-300'
                          : atCap
                          ? 'cursor-not-allowed border-white/10 bg-white/[0.01] text-stone-600'
                          : 'border-white/15 bg-white/[0.03] text-stone-300 hover:border-white/25 hover:text-stone-100'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}

                {form.lookingFor
                  .filter((opt) => !LOOKING_FOR_OPTIONS.some((tag) => tag.toLowerCase() === opt.toLowerCase()))
                  .map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          lookingFor: toggleArrayItem(prev.lookingFor, opt),
                        }))
                      }
                      className="rounded-full border border-emerald-300/35 bg-emerald-400/[0.14] px-4 py-1.5 text-xs font-medium text-emerald-200 transition hover:border-emerald-200/70"
                    >
                      {opt} ×
                    </button>
                  ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <input
                  value={customLookingFor}
                  onChange={(e) => setCustomLookingFor(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomLookingFor()
                    }
                  }}
                  type="text"
                  placeholder="Add custom looking-for..."
                  maxLength={40}
                  className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-stone-100 placeholder-stone-400 focus:border-white/30 focus:bg-white/[0.09] outline-none"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={addCustomLookingFor}
                  className="rounded-full border border-amber-400/40 bg-amber-300/20 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:border-amber-100/70 hover:bg-amber-200/30"
                >
                  Add
                </button>
              </div>
            </section>

            {/* Interests */}
            <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl sm:p-7">
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">Interests (done and would do again)</p>
              <div className="mt-3 text-xs text-stone-400">
                These are activities and energies you have experience with and want more of.
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {INTEREST_TAG_OPTIONS.map((opt) => {
                  const active = hasValueCaseInsensitive(form.interests, opt)
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          interests: toggleArrayItem(prev.interests, opt),
                        }))
                      }
                      className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                        active
                          ? 'border-white/30 bg-white/[0.09] text-stone-100'
                          : 'border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20 hover:text-stone-300'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}

                {form.interests
                  .filter((opt) => !INTEREST_TAG_OPTIONS.some((tag) => tag.toLowerCase() === opt.toLowerCase()))
                  .map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          interests: toggleArrayItem(prev.interests, opt),
                        }))
                      }
                      className="rounded-full border border-cyan-300/35 bg-cyan-400/[0.12] px-4 py-1.5 text-xs font-medium text-cyan-200 transition hover:border-cyan-200/70"
                    >
                      {opt} ×
                    </button>
                  ))}
              </div>

              <div className="mt-4 flex items-center gap-2" style={{ minWidth: 0 }}>
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomInterest()
                    }
                  }}
                  placeholder="Add custom interest..."
                  className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-stone-100 placeholder-stone-400 focus:border-white/30 focus:bg-white/[0.09] outline-none"
                  maxLength={32}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={addCustomInterest}
                  className="rounded-full border border-amber-400/40 bg-amber-300/20 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:border-amber-100/70 hover:bg-amber-200/30"
                >
                  Add
                </button>
              </div>
            </section>

            {/* Curious */}
            <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl sm:p-7">
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">Curious / might try</p>
              <div className="mt-3 text-xs text-stone-400">
                Things you might want to explore, even if you have not done them yet.
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {KINK_OPTIONS.map((opt) => {
                  const active = hasValueCaseInsensitive(form.kinks, opt)
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          kinks: toggleArrayItem(prev.kinks, opt),
                        }))
                      }
                      className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                        active
                          ? 'border-fuchsia-300/45 bg-fuchsia-400/[0.16] text-fuchsia-100'
                          : 'border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20 hover:text-stone-300'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}

                {form.kinks
                  .filter((opt) => !KINK_OPTIONS.some((tag) => tag.toLowerCase() === opt.toLowerCase()))
                  .map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          kinks: toggleArrayItem(prev.kinks, opt),
                        }))
                      }
                      className="rounded-full border border-fuchsia-300/45 bg-fuchsia-400/[0.16] px-4 py-1.5 text-xs font-medium text-fuchsia-100 transition hover:border-fuchsia-200/80"
                    >
                      {opt} ×
                    </button>
                  ))}
              </div>

              <div className="mt-4 flex items-center gap-2" style={{ minWidth: 0 }}>
                <input
                  type="text"
                  value={customKink}
                  onChange={(e) => setCustomKink(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomKink()
                    }
                  }}
                  placeholder="Add something you might try..."
                  className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-stone-100 placeholder-stone-400 focus:border-white/30 focus:bg-white/[0.09] outline-none"
                  maxLength={32}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={addCustomKink}
                  className="rounded-full border border-fuchsia-300/45 bg-fuchsia-400/[0.16] px-3 py-1.5 text-xs font-semibold text-fuchsia-100 transition hover:border-fuchsia-200/80 hover:bg-fuchsia-300/25"
                >
                  Add
                </button>
              </div>
            </section>

            {/* Bio */}
            <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl sm:p-7">
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">About you</p>
              <div className="mt-4">
                <label className="mb-1.5 block text-xs text-stone-400" htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell other members a little about yourself…"
                  rows={4}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </section>

            {/* Feedback & save */}
            {error && (
              <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {message}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl border border-white/20 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save profile'}
              </button>
            </div>

            </form>
            <div className="w-full md:w-96 shrink-0 flex flex-col gap-6">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">View workflow</p>
                <h2 className="mt-2 text-lg font-semibold text-stone-100">Preview is now its own page</h2>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  Keep editing here, then open your separate view page to check how the profile reads without the form controls around it.
                </p>
                <Link
                  href={ROUTES.PROFILE_VIEW}
                  className="mt-4 inline-flex rounded-xl border border-white/20 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]"
                >
                  View my profile
                </Link>
              </div>
              <div>
                <h2 className="mb-2 mt-4 text-sm font-semibold text-stone-200">Photo Gallery</h2>
                <div className="mb-3 flex justify-end">
                  <Link
                    href={ROUTES.PROFILE_CAM}
                    className="rounded-xl border border-white/20 bg-white/[0.06] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]"
                  >
                    Camera
                  </Link>
                </div>
                <PhotoCropUpload onUpload={handlePhotoUpload} />
                <div className="mt-4">
                  <ProfileGallery photoUrls={photoUrls} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  )
}