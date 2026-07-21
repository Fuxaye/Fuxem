import Link from 'next/link'

const mockProfile = {
  displayName: 'Nia Vale',
  username: 'niavale',
  age: 29,
  joinedAt: 'Aug 2024',
  location: 'Austin, Texas, USA',
  bio: 'I like good conversation, mutual respect, and people who are direct about what they want. Usually online in the evenings. If we click, I am down for voice first and then video.',
  interests: ['Live Music', 'Coffee Shops', 'Hiking', 'Late Night Chats', 'Travel', 'Film'],
  lookingFor: ['Friends', 'Dating', '1-on-1 Cam'],
  photos: [
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
  ],
}

export default function MockProfilePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 text-stone-100 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-amber-100">
        <p className="text-xs uppercase tracking-[0.2em]">Preview Mode</p>
        <p className="mt-1 text-sm text-amber-50/90">
          This is a seeded mock profile to visualize a typical member page layout.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={mockProfile.photos[0]}
                alt={`${mockProfile.displayName} avatar`}
                className="h-20 w-20 rounded-full border border-white/20 object-cover"
              />
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Member Profile</p>
                <h1 className="mt-1 text-3xl font-semibold text-stone-100">{mockProfile.displayName}</h1>
                <p className="mt-1 text-sm text-stone-400">@{mockProfile.username}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg border border-white/20 bg-white/[0.03] px-4 py-2 text-sm text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]">
                Message
              </button>
              <button className="rounded-lg border border-white/20 bg-white/[0.03] px-4 py-2 text-sm text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]">
                Add Friend
              </button>
              <button className="rounded-lg border border-white/20 bg-white/[0.03] px-4 py-2 text-sm text-stone-100 transition hover:border-white/35 hover:bg-white/[0.1]">
                Send Wave
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm text-stone-300 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Location</span>
              <p className="mt-1 text-stone-200">
                {mockProfile.age} • {mockProfile.location}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Member Since</span>
              <p className="mt-1 text-stone-200">{mockProfile.joinedAt}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">About</p>
            <p className="mt-2 text-sm leading-6 text-stone-200">{mockProfile.bio}</p>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Looking For</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {mockProfile.lookingFor.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1 text-xs text-amber-100"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Interests</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {mockProfile.interests.map((interest) => (
                <span key={interest} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-stone-200">
                  {interest}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-xs text-stone-400">
        Public profile information only. Sensitive account details stay private.
      </div>

      <section className="mt-6 rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-100">Recent Photos</h2>
          <Link href="/profile" className="text-sm text-amber-200 hover:text-amber-100">
            Edit my real profile
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {mockProfile.photos.map((url, idx) => (
            <div key={url} className="overflow-hidden rounded-xl border border-white/10">
              <img
                src={url}
                alt={`${mockProfile.displayName} photo ${idx + 1}`}
                className="h-40 w-full object-cover transition duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
