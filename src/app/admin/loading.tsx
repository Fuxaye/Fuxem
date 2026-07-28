export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090b10]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
        <p className="text-sm uppercase tracking-[0.18em] text-stone-400">Loading admin panel...</p>
      </div>
    </div>
  )
}

